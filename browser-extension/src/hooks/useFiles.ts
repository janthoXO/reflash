import { sendToBackground } from "@plasmohq/messaging"

import type { LLMSettings } from "~models/settings"

export function useFiles() {
  async function scanFiles(llmSettings: LLMSettings) {
    console.debug("useFiles: scanFiles called with LLM settings", llmSettings)
    await sendToBackground({
      name: "files-scan",
      body: { llmSettings: llmSettings }
    })
  }

  return { scanFiles }
}
