import axios from "axios";
import type { PlasmoCSConfig } from "plasmo";

import { useMessage } from "@plasmohq/messaging/hook";

import type { File } from "~models/file";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
};

export default function FilesDownload() {
  /**
   * Content Script - Listens to files-download
   */
  useMessage<{ courseUrl: string; files: File[] }, { files: File[] }>(
    async (req, res) => {
      if (req.name !== "files-download" || !req.body) return;

      console.debug("Received files-download", req);

      const siteCourseUrl = window.location.href;
      if (siteCourseUrl !== req.body.courseUrl) {
        console.warn(
          `Course URL mismatch: expected ${req.body.courseUrl}, got ${siteCourseUrl}`
        );
      }

      downloadPDFs(req.body.files).then((files) => {
        // Publish FILES_SCANNED event
        console.debug("Return scanned files ", files);
        res.send({ files: files });
      });
    }
  );

  return null;
}

async function downloadPDFs(files: File[]): Promise<File[]> {
  // Download each PDF as a blob
  for (const file of files) {
    try {
      // 1. THE PROBE: Axios GET with Range
      // We rely on the server honoring "Range" to keep this fast.
      const preCheck = await axios.get(file.url, {
        headers: { Range: "bytes=0-0" },
        withCredentials: true, // Important for Moodle Cookies
        validateStatus: (status) => status < 400, // Accept 200 and 206
      });

      // Axios headers are lowercase by default
      const type = preCheck.headers["content-type"];

      if (!type || !type.includes("application/pdf")) {
        console.warn(`⚠️ Not a PDF. Type: ${type}`);
        continue;
      }

      // 2. Extract Name
      const disposition = preCheck.headers["content-disposition"];

      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/);
        if (match && match[1]) {
          file.name = decodeURIComponent(match[1]);
        }
      }

      console.log(`⬇️ Downloading full file: ${file.name}`);
      // 3. THE DOWNLOAD: Axios with Blob response
      const response = await axios.get(file.url, {
        responseType: "blob", // Critical for binary files
        withCredentials: true,
      });

      file.blob = response.data;
      file.base64 = await blobToBase64(file.blob!, "application/pdf"); // response.data is the Blob
      console.log(`Downloaded PDF: ${file.name}`);
    } catch (error) {
      console.error(`Error downloading ${file.url}:`, error);
    }
  }

  return files;
}

function blobToBase64(blob: Blob, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrlPrefix = `data:${mimeType};base64,`;
      const base64WithDataUrlPrefix = reader.result as string;
      const base64 = base64WithDataUrlPrefix.replace(dataUrlPrefix, "");
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
