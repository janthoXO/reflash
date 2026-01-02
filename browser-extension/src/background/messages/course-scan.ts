import type { Course } from "@reflash/shared";

import type { PlasmoMessaging } from "@plasmohq/messaging";
import { sendToContentScript } from "@plasmohq/messaging";

import { db } from "~db/db";
import type { File } from "~models/file";
import type { LLMSettings } from "~models/settings";
import { alertPopup } from "~background/alertManager";
import { setPromptToStorage } from "~local-storage/prompts";

// handles the event loop for scanning the course for new files
const handler: PlasmoMessaging.MessageHandler<
  { llmSettings: LLMSettings; customPrompt: string },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "course-scan") return;

  if (!req.body) {
    // this should not happen
    console.error("No body in course-scan request");
    await alertPopup({
      level: "error",
      message: "Failed to scan course: no request body",
    });
    res.send({});
    return;
  }

  console.debug("Background received course-scan request");

  try {
    // request files on site
    console.debug("Requesting files-scan in content script");
    const { courseUrl, files: filesOnlyUrl } = await sendToContentScript<
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {},
      { courseUrl: string; files: File[] }
    >({
      name: "files-scan",
      body: {},
    });

    // check if course already exists, if not, create new course
    let course = await db.courses.get({ url: courseUrl });

    // check which units already exist in this course and compare to files
    let newFiles: File[] = [];
    if (course && !course.deletedAt) {
      const savedUnits = await db.units
        .where("courseId")
        .equals(course.id)
        .filter((unit) => unit.deletedAt === null)
        .toArray();

      const savedFileUrls = new Set(savedUnits.map((u) => u.fileUrl));
      newFiles = filesOnlyUrl.filter((f) => !savedFileUrls.has(f.url));
    }

    if (newFiles.length === 0) {
      console.debug("No new files to download for course ", course);
      await alertPopup({
        level: "info",
        message: `No new files found.`,
      });
      res.send({});
      return;
    }

    await alertPopup({
      level: "info",
      message: `Found ${newFiles.length} new files.`,
    });

    if (!course) {
      console.debug("Creating new course for url ", courseUrl);
      course = { name: "New Course", url: courseUrl, updatedAt: Date.now(), deletedAt: null } as Course;
      course.id = await db.courses.add(course);
    } else if (course.deletedAt) {
      console.debug("Restoring deleted course ", courseUrl);
      await db.courses.update(course.id, {
        deletedAt: null,
        updatedAt: Date.now(),
      });
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
  } catch (e) {
    console.error("Error in course-scan handler:", e);
    await alertPopup({
      level: "error",
      message: `Failed to scan course`,
    });
  } finally {
    res.send({});
  }
};

export default handler;
