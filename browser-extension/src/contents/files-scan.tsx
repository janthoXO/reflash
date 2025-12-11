import type { PlasmoCSConfig } from "plasmo";

import { useMessage } from "@plasmohq/messaging/hook";

import type { File } from "~models/file";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
};

export default function FilesScan() {
  /**
   * Content Script - Listens to files-scan
   */
  useMessage<{}, { courseUrl: string; files: File[] }>(async (req, res) => {
    if (req.name !== "files-scan") return;

    console.debug("Received files-scan", req);

    const courseUrl = window.location.href;
    scanForPDFLinks().then((files) => {
      // Publish FILES_SCANNED event
      console.debug("Return scanned files ", files);
      res.send({ courseUrl: courseUrl, files: files });
    });
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
