import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Unit } from "~models/unit";
import { FileSchema } from "~models/file";
import { alertPopup } from "~background/alertManager";
import { setupOffscreenDocument } from "~background/offscreenManager";
import { db } from "~db/db";
import { LLMSettingsSchema } from "~models/settings";
import z from "zod";
import { AlertLevel } from "~models/alert";

const RequestSchema = z.object({
  courseId: z.number(),
  llmSettings: LLMSettingsSchema,
  customPrompt: z.string(),
  file: FileSchema,
});

type RequestType = z.infer<typeof RequestSchema>;

// receives files from the content script, checks the course and forwards them to the offscreen document
const handler: PlasmoMessaging.MessageHandler<
  RequestType,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "flashcards-generate") return;

  console.debug(
    "[Background: flashcards-generate] received request\n",
    req.body
  );

  const reqBodyParsed = RequestSchema.safeParse(req.body);
  if (!reqBodyParsed.success) {
    // this should not happen
    console.error("[Background: flashcards-generate] Invalid body in request");
    await alertPopup({
      level: AlertLevel.Error,
      message: "Failed to generate flashcards",
    });
    res.send({});
    return;
  }
  const reqBody: RequestType = reqBodyParsed.data;

  try {
    await setupOffscreenDocument();

    // save unit with generationFlag true to indicate generation in progress
    const unit: Unit = {
      name: reqBody.file.name,
      fileName: reqBody.file.name,
      fileUrl: reqBody.file.url,
      courseId: reqBody.courseId,
      updatedAt: Date.now(),
      deletedAt: null,
      isGenerating: true,
    } as Unit;

    // unit might exist but is soft deleted
    const existingUnit = await db.units.get({
      fileUrl: unit.fileUrl,
      courseId: unit.courseId,
    });
    let unitId: number;
    if (existingUnit) {
      console.debug("Unit already exists, updating ", unit.fileUrl);
      unit.id = existingUnit.id;
      await db.units.update(existingUnit.id, unit);
      unitId = unit.id;
    } else {
      unitId = await db.units.add(unit);
    }

    // Forward the files to the offscreen document
    const payload = {
      courseId: reqBody.courseId,
      unitId: unitId,
      fileBase64: reqBody.file.base64,
      llmSettings: reqBody.llmSettings,
      customPrompt: reqBody.customPrompt,
    };
    console.debug("Requesting flashcard generation for file\n", payload);
    // response gonna be returned asynchronously
    // TODO adjust to Firefox
    await chrome.runtime.sendMessage({
      name: "flashcards-generate",
      body: payload,
    });
  } catch (e) {
    console.error("Error in flashcards-generate handler:", e);
    await alertPopup({
      level: AlertLevel.Error,
      message: `Failed to generate flashcards`,
    });
  } finally {
    res.send({});
  }
};

export default handler;
