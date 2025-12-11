import { sendToBackground } from "@plasmohq/messaging";

import type { LLMSettings } from "~models/settings";

export function useCourse() {
  async function scanFiles(llmSettings: LLMSettings) {
    console.debug("useFiles: scanFiles called with LLM settings", llmSettings);
    await sendToBackground({
      name: "files-scan",
      body: { llmSettings: llmSettings },
    });
  }

  async function trackCourse(llmSettings: LLMSettings) {
    scanFiles(llmSettings);
  }

  return { scanFiles, trackCourse };
}
