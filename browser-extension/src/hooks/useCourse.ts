import { sendToBackground } from "@plasmohq/messaging";
import { getPromptFromStorage } from "~local-storage/prompts";

import type { LLMSettings } from "~models/settings";

export function useCourse() {
  async function scanFiles(
    courseId: number | undefined,
    llmSettings: LLMSettings
  ) {
    const customPrompt = await getPromptFromStorage(courseId);
    console.debug(
      `useCourse: course-scan called with LLM settings ${llmSettings} and prompt ${customPrompt}`
    );
    await sendToBackground({
      name: "course-scan",
      body: { llmSettings: llmSettings, customPrompt: customPrompt },
    });
  }

  async function trackCourse(
    courseId: number | undefined,
    llmSettings: LLMSettings
  ) {
    scanFiles(courseId, llmSettings);
  }

  return { scanFiles, trackCourse };
}
