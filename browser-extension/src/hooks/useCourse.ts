import { sendToBackground } from "@plasmohq/messaging";
import { useState } from "react";
import { getPromptFromStorage } from "~local-storage/prompts";

import type { LLMSettings } from "~models/settings";

export function useCourse() {
  const [loading, setLoading] = useState(false);

  async function scanFiles(
    courseId: number | undefined,
    llmSettings: LLMSettings,
    customPrompt?: string
  ) {
    if (!customPrompt) {
      customPrompt = await getPromptFromStorage(courseId);
    }
    console.debug(
      "useCourse: course-scan called with LLM settings\n",
      llmSettings,
      "and prompt\n",
      customPrompt
    );

    setLoading(true);
    await sendToBackground({
      name: "course-scan",
      body: { llmSettings: llmSettings, customPrompt: customPrompt },
    });
    setLoading(false);
  }

  async function trackCourse(llmSettings: LLMSettings, customPrompt?: string) {
    scanFiles(undefined, llmSettings, customPrompt);
  }

  return { scanFiles, trackCourse, loading };
}
