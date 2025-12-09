import { sendToBackground } from "@plasmohq/messaging"

export function useFiles() {
  async function scanFiles() {
    await sendToBackground({
      name: "files-scan",
      body: {}
    })
  }

  return { scanFiles }
}
