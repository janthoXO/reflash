import { sendToBackground } from "@plasmohq/messaging";
import { useState } from "react";
import { retry } from "~lib/retry";
import { useAlertStorage } from "~local-storage/alert";
import { getPromptFromStorage } from "~local-storage/prompts";
import { AlertLevel } from "~models/alert";

import type { LLMSettings } from "~models/settings";

export function useCourse() {
  const { setAlert } = useAlertStorage();
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

    try {
      await retry(
        async () =>
          await sendToBackground({
            name: "course-scan",
            body: { llmSettings: llmSettings, customPrompt: customPrompt },
          }),
        3
      );
    } catch (error) {
      console.error("Error during course scan:", error);
      setAlert({
        level: AlertLevel.Error,
        message: "Failed to scan course files.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function trackCourse(llmSettings: LLMSettings, customPrompt?: string) {
    scanFiles(undefined, llmSettings, customPrompt);
  }

  return { scanFiles, trackCourse, loading };
}
