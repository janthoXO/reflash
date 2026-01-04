import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Unit } from "~models/unit";
import { FileSchema } from "~models/file";
import { alertPopup } from "~background/alertManager";
import { setupOffscreenDocument } from "~background/offscreenManager";
import { db } from "~db/db";
import { LLMSettingsSchema } from "~models/settings";
import z from "zod";
import { AlertLevel } from "~models/alert";
import { retry } from "~lib/retry";

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
  if (req.name !== "units-setup") return;

  console.debug("[Background: units-setup] received request\n", req.body);

  try {
    const reqBody = RequestSchema.parse(req.body);

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
      console.debug(
        "[Background: units-setup] Unit already exists, updating ",
        unit.fileUrl
      );
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
    console.debug(
      "[Background: units-setup] Requesting flashcard generation for file\n",
      payload
    );
    // response gonna be returned asynchronously
    // TODO adjust to Firefox
    await retry(
      async () =>
        await chrome.runtime.sendMessage({
          name: "flashcards-generate",
          body: payload,
        }),
      3
    );
  } catch (e) {
    console.error("[Background: units-setup] Error:", e);
    await alertPopup({
      level: AlertLevel.Error,
      message: `Failed to setup unit for flashcard generation`,
    });
  } finally {
    res.send({});
  }
};

export default handler;
