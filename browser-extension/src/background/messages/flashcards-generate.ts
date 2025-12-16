import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Unit } from "@reflash/shared";
import { setupOffscreenDocument } from "~background/offscreenManager";
import { db } from "~db/db";
import type { LLMSettings } from "~models/settings";

// receives files from the content script, checks the course and forwards them to the offscreen document
const handler: PlasmoMessaging.MessageHandler<
  {
    courseId: number;
    llmSettings: LLMSettings;
    customPrompt: string;
    file: File;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (!req.body) {
    res.send({});
    return;
  }

  await setupOffscreenDocument();

  // send files to LLM
  console.debug("Requesting flashcard generation for files ", req.body.file);
  // Forward the message to the offscreen document
  // TODO adjust to Firefox
  const { unit }: { unit: Unit } = await chrome.runtime.sendMessage({
    name: "flashcards-generate",
    body: {
      courseId: req.body.courseId,
      file: req.body.file,
      llmSettings: req.body.llmSettings,
      customPrompt: req.body.customPrompt,
    },
  });
  if (!unit || !unit.cards) {
    console.warn("Received empty unit from offscreen");
    res.send({});
    return;
  }

  const unitId = await db.units.add(unit);
  unit.cards = unit.cards.map((card) => {
    card.unitId = unitId;
    card.dueAt = new Date().getTime();
    return card;
  });
  await db.flashcards.bulkAdd(unit.cards);
  res.send({});
};

export default handler;
