import axios from "axios";
import type { PlasmoCSConfig } from "plasmo";

import { useMessage } from "@plasmohq/messaging/hook";

import { FileSchema, type File } from "~models/file";
import { LLMSettingsSchema } from "~models/settings";
import { sendToBackground } from "@plasmohq/messaging";
import z from "zod";
import { AlertLevel } from "~models/alert";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
};

const RequestSchema = z.object({
  courseId: z.number(),
  courseUrl: z.string(),
  llmSettings: LLMSettingsSchema,
  customPrompt: z.string(),
  files: z.array(FileSchema),
});

type RequestType = z.infer<typeof RequestSchema>;

export default function FilesDownload() {
  useMessage<
    RequestType,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {}
  >(async (req, res) => {
    if (req.name !== "files-download") return;

    console.debug("[Content Script: files-scan] Received request\n", req.body);

    const reqBodyParsed = RequestSchema.safeParse(req.body);
    if (!reqBodyParsed.success) {
      console.error("[Content Script: files-download] Invalid body in request");
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: AlertLevel.Error,
            message: "Failed to download files",
          },
        },
      });
      res.send({});
      return;
    }
    const reqBody: RequestType = reqBodyParsed.data;

    const siteCourseUrl = window.location.href;
    if (siteCourseUrl !== reqBody.courseUrl) {
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: AlertLevel.Error,
            message: "Failed to download files: course URL mismatch",
          },
        },
      });
      console.error(
        `[Content Script: files-download] Course URL mismatch: expected ${reqBody.courseUrl}, got ${siteCourseUrl}`
      );
      res.send({});
      return;
    }

    try {
      await Promise.all(
        reqBody.files.map((file) =>
          downloadPDF(file).then((file) => {
            if (!file || !file.base64) return;

            sendToBackground({
              name: "units-setup",
              body: {
                courseId: reqBody.courseId,
                llmSettings: reqBody.llmSettings,
                customPrompt: reqBody.customPrompt,
                file: file,
              },
            });
            console.debug(
              "[Content Script: files-download] Send downloaded file to background\n",
              file
            );
          })
        )
      );
    } catch (e) {
      console.error("[Content Script: files-download] Error:", e);
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: AlertLevel.Error,
            message: "Failed to download files",
          },
        },
      });
    } finally {
      res.send({});
    }
  });

  return null;
}

async function downloadPDF(file: File): Promise<File | null> {
  // Download each PDF as a blob
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
      console.warn(`[Content Script: files-download] Not a PDF. Type: ${type}`);
      return null;
    }

    // 2. Extract Name
    const disposition = preCheck.headers["content-disposition"];

    if (disposition && disposition.includes("filename=")) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/);
      if (match && match[1]) {
        file.name = decodeURIComponent(match[1]);
      }
    }

    console.debug(
      `[Content Script: files-download] Downloading full file: ${file.name}`
    );
    // 3. THE DOWNLOAD: Axios with Blob response
    const response = await axios.get(file.url, {
      responseType: "blob", // Critical for binary files
      withCredentials: true,
    });

    file.base64 = await blobToBase64(response.data!, "application/pdf"); // response.data is the Blob
    console.debug(
      `[Content Script: files-download] Downloaded PDF: ${file.name}`
    );
  } catch (error) {
    console.error(
      `[Content Script: files-download] Error downloading ${file.url}:`,
      error
    );
  }

  return file;
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
