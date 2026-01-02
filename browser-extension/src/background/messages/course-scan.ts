import type { Course } from "@reflash/shared";

import type { PlasmoMessaging } from "@plasmohq/messaging";
import { sendToContentScript } from "@plasmohq/messaging";

import { db } from "~db/db";
import type { File } from "~models/file";
import type { LLMSettings } from "~models/settings";
import { setPromptToStorage } from "~local-storage/prompts";

// handles the event loop for scanning the course for new files
const handler: PlasmoMessaging.MessageHandler<
  { llmSettings: LLMSettings; customPrompt: string },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (!req.body) {
    // TODO send error on error channel
    res.send({});
    return;
  }

  console.debug("Background received course-scan request");

  // request files on site
  console.debug("Requesting files-scan in content script");
  const {
    courseUrl,
    files: filesOnlyUrl,
  }: { courseUrl: string; files: File[] } = await sendToContentScript({
    name: "files-scan",
    body: {},
  });

  // check if course already exists, if not, create new course
  let course = await db.courses.get({ url: courseUrl });

  // check which units already exist in this course and compare to files
  let newFiles: File[] = [];
  if (course) {
    const savedUnits = await db.units
      .where("courseId")
      .equals(course.id)
      .toArray();

    const savedFileUrls = new Set(savedUnits.map((u) => u.fileUrl));
    newFiles = filesOnlyUrl.filter((f) => !savedFileUrls.has(f.url));
  }

  if (newFiles.length === 0) {
    console.debug("No new files to download for course ", course);
    res.send({});
    return;
  }

  if (!course) {
    console.debug("Creating new course for url ", courseUrl);
    course = { name: "New Course", url: courseUrl } as Course;
    course.id = await db.courses.add(course);
  }

  // save custom prompt to course
  await setPromptToStorage(course.id, req.body.customPrompt);

  // send new file Urls for download
  console.debug("Requesting download for new files ", newFiles);
  await sendToContentScript({
    name: "files-download",
    body: {
      courseId: course.id,
      courseUrl: course.url,
      llmSettings: req.body.llmSettings,
      customPrompt: req.body.customPrompt,
      files: newFiles,
    },
  });

  res.send({});
};

export default handler;
