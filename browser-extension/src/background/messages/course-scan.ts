import type { Course } from "~models/course";

import type { PlasmoMessaging } from "@plasmohq/messaging";
import { sendToContentScript } from "@plasmohq/messaging";

import { db } from "~db/db";
import type { File } from "~models/file";
import { LLMSettingsSchema } from "~models/settings";
import { alertPopup } from "~background/alertManager";
import { setPromptToStorage } from "~local-storage/prompts";
import z from "zod";
import { AlertLevel } from "~models/alert";

const RequestSchema = z.object({
  llmSettings: LLMSettingsSchema,
  customPrompt: z.string(),
});

type RequestType = z.infer<typeof RequestSchema>;

// handles the event loop for scanning the course for new files
const handler: PlasmoMessaging.MessageHandler<
  RequestType,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "course-scan") return;

  console.debug("[Background: course-scan] received request\n", req.body);

  try {
    const reqBody = RequestSchema.parse(req.body);

    // request files on site
    const { courseUrl, files: filesOnlyUrl } = await sendToContentScript<
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {},
      { courseUrl: string; files: File[] }
    >({
      name: "files-scan",
      body: {},
    });

    // check which units already exist in this course and compare to files
    let course = await db.courses.get({ url: courseUrl });
    let newFiles: File[] = [];
    if (course && !course.deletedAt) {
      // if course already exists and is not deleted, filter out existing files
      const savedUnits = await db.units
        .where("courseId")
        .equals(course.id)
        .filter((unit) => unit.deletedAt === null)
        .toArray();

      const savedFileUrls = new Set(savedUnits.map((u) => u.fileUrl));
      newFiles = filesOnlyUrl.filter((f) => !savedFileUrls.has(f.url));
    } else {
      newFiles = filesOnlyUrl;
    }

    if (newFiles.length === 0) {
      console.debug(
        "[Background: course-scan] No new files to download for course\n",
        course
      );
      await alertPopup({
        level: AlertLevel.Info,
        message: `No new files found.`,
      });
      res.send({});
      return;
    }

    await alertPopup({
      level: AlertLevel.Info,
      message: `Found ${newFiles.length} new files.`,
    });

    // create course if it does not exist
    if (!course) {
      console.debug(
        "[Background: course-scan] Creating new course for url: ",
        courseUrl
      );
      course = {
        name: "New Course",
        url: courseUrl,
        updatedAt: Date.now(),
        deletedAt: null,
      } as Course;
      course.id = await db.courses.add(course);
    } else if (course.deletedAt) {
      console.debug(
        "[Background: course-scan] Restoring deleted course: ",
        courseUrl
      );
      await db.courses.update(course.id, {
        deletedAt: null,
        updatedAt: Date.now(),
      });
    }

    // save custom prompt to course
    await setPromptToStorage(course.id, reqBody.customPrompt);

    // send new file Urls for download
    console.debug(
      "[Background: course-scan] Requesting download for new files\n",
      newFiles
    );
    await sendToContentScript({
      name: "files-download",
      body: {
        courseId: course.id,
        courseUrl: course.url,
        llmSettings: reqBody.llmSettings,
        customPrompt: reqBody.customPrompt,
        files: newFiles,
      },
    });
  } catch (e) {
    console.error("[Background: course-scan] Error:", e);
    await alertPopup({
      level: AlertLevel.Error,
      message: `Failed to scan course`,
    });
  } finally {
    res.send({});
  }
};

export default handler;
