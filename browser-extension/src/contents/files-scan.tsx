import type { PlasmoCSConfig } from "plasmo";

import { useMessage } from "@plasmohq/messaging/hook";

import type { File } from "~models/file";
import { sendToBackground } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
};

export default function FilesScan() {
  // TODO extract course heading as courseName and return
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  useMessage<{}, { courseUrl: string; files: File[] }>(async (req, res) => {
    if (req.name !== "files-scan") return;
    
    console.debug("Received files-scan", req);

    try {
      const courseUrl = window.location.href;
      const files = await scanForPDFLinks();

      console.debug("Return scanned files ", {courseUrl, files});
      res.send({ courseUrl: courseUrl, files: files });
    } catch (e) {
      console.error("Error in files-scan:", e);
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: "error",
            message: "Failed to scan for files",
          },
        },
      });
      res.send({ courseUrl: "", files: [] });
    }
  });

  return null;
}

async function scanForPDFLinks(): Promise<File[]> {
  // Find all links on the page
  const linkToFileMap = new Map<string, File>();
  document
    .querySelectorAll<HTMLAnchorElement>("a[href]")
    .values()
    .forEach((link) => {
      if (
        !link.href.includes("/mod/resource/view.php") && // Moodle Files
        !link.href.endsWith(".pdf") && // Standard PDFs
        !link.href.includes(".pdf?")
      ) {
        return;
      }

      if (linkToFileMap.has(link.href)) {
        return;
      }

      const name = link.textContent?.trim() + ".pdf";

      linkToFileMap.set(link.href, {
        name: name,
        url: link.href,
      });
    });

  return Array.from(linkToFileMap.values());
}
