import { useMessage } from "@plasmohq/messaging/hook"
import axios from "axios"
import type { PlasmoCSConfig } from "plasmo"
import type { File } from "~models/file"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export default function FilesScan() {

/**
 * Content Script - Listens to files-scan
 */
useMessage<{}, {courseUrl: String, files: File[]}>(async (req, res) => {
      console.debug("Received files-scan", req)

  if (req.name !== "files-scan") {
        console.warn("Unknown message name:", req.name)
    res.send({courseUrl: "", files: []})
    return 
  }

  const courseUrl = window.location.href;
    scanAndDownloadPDFs()
      .then((files) => {
        // Publish FILES_SCANNED event
        console.debug("Return scanned files ", files)
        res.send({courseUrl: courseUrl, files: files})
      })
})

return null
}

async function scanAndDownloadPDFs(): Promise<File[]> {
  // Find all links on the page
  var linkToFileMap = new Map<string, File>()
document.querySelectorAll<HTMLAnchorElement>("a[href]").values().forEach((link) => {
if (      !link.href.includes("/mod/resource/view.php") && // Moodle Files
      !link.href.endsWith(".pdf") &&                // Standard PDFs
      !link.href.includes(".pdf?")) {
return;
      }

           const clone = link.cloneNode(true) as HTMLElement
         clone.querySelectorAll(".accesshide, .sr-only").forEach(el => el.remove())
         const name = clone.textContent?.trim() + ".pdf"

  linkToFileMap.set(link.href, { name: name, blob: undefined, base64: "", url: link.href })
})

  // Download each PDF as a blob
  const files: File[] = []
  for (const file of linkToFileMap.values()) {
    try {
      // 1. THE PROBE: Axios GET with Range
      // We rely on the server honoring "Range" to keep this fast.
      const preCheck = await axios.get(file.url, {
        headers: { "Range": "bytes=0-0" },
        withCredentials: true, // Important for Moodle Cookies
        validateStatus: (status) => status < 400 // Accept 200 and 206
      })

      // Axios headers are lowercase by default
      const type = preCheck.headers["content-type"]
      
      if (!type || !type.includes("application/pdf")) {
        console.warn(`⚠️ Not a PDF. Type: ${type}`)
        continue
      }

      // 2. Extract Name
      let name = "document.pdf"
      const disposition = preCheck.headers["content-disposition"]
      
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename=["']?([^"';]+)["']?/)
        if (match && match[1]) {
          file.name = decodeURIComponent(match[1])
        }
      }

      console.log(`⬇️ Downloading full file: ${file.name}`)
      // 3. THE DOWNLOAD: Axios with Blob response
      const response = await axios.get(file.url, {
        responseType: "blob", // Critical for binary files
        withCredentials: true
      })
      
      file.base64 = await blobToBase64(response.data, "application/pdf") // response.data is the Blob

      files.push(file)

      console.log(`Downloaded PDF: ${file.name}`)
    } catch (error) {
      console.error(`Error downloading ${file.url}:`, error)
    }
  }

  return files
}

function blobToBase64(blob: Blob, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrlPrefix = `data:${mimeType};base64,`;
      const base64WithDataUrlPrefix = reader.result as string;
      const base64 = base64WithDataUrlPrefix.replace(dataUrlPrefix, '');
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
