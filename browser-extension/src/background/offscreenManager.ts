const OFFSCREEN_DOCUMENT_PATH = "tabs/offscreen.html";

async function hasOffscreenDocument() {
  if ("getContexts" in chrome.runtime) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contexts = await (chrome.runtime as any).getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
    });
    return contexts.length > 0;
  }

  return false;
}

let setupPromise: Promise<void> | null = null;

export async function setupOffscreenDocument() {
  if (await hasOffscreenDocument()) return;
  if (setupPromise) return setupPromise;

  setupPromise = chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: "LLM processing",
  });

  return setupPromise;
}
