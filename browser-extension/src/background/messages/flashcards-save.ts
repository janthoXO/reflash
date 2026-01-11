import type { PlasmoMessaging } from "@plasmohq/messaging";
import z from "zod";
import { alertPopup } from "~background/alertManager";
import { db } from "~db/db";
import { AlertLevel } from "~models/alert";
import { FlashcardSchema, type Flashcard } from "~models/flashcard";

const RequestSchema = z.object({
  courseId: z.number(),
  unitId: z.number(),
  cards: z.array(
    FlashcardSchema.pick({
      question: true,
      answer: true,
    })
  ),
});

type RequestType = z.infer<typeof RequestSchema>;

const handler: PlasmoMessaging.MessageHandler<
  RequestType,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "flashcards-save") return;

  console.debug("[Background: flashcards-save] Received request", req.body);

  try {
    const reqBody = RequestSchema.parse(req.body);

    const unit = await db.units.get({
      id: reqBody.unitId,
      courseId: reqBody.courseId,
    });
    if (!unit || unit.deletedAt) {
      console.error(
        `[Background: flashcards-save] Unit ${reqBody.unitId} not found`
      );
      await alertPopup({
        level: AlertLevel.Error,
        message: `Failed to save flashcards: unit not found`,
      });
      res.send({});
      return;
    }

    const now = Date.now();
    await db.units.update(reqBody.unitId, {
      updatedAt: now,
      isGenerating: false,
    });

    if (reqBody.cards.length === 0) {
      console.warn("[Background: flashcards-save] Received empty unit");
      await alertPopup({
        level: AlertLevel.Warning,
        message: `No flashcards were generated for ${unit.name}.`,
      });
      res.send({});
      return;
    }

    const cards: Flashcard[] = reqBody.cards.map((card) => {
      return {
        ...card,
        unitId: unit.id,
        dueAt: now,
        updatedAt: now,
        deletedAt: null,
      };
    }) as Flashcard[];
    await db.flashcards.bulkAdd(cards);
  } catch (e) {
    console.error("Error in flashcards-save handler:", e);
    await alertPopup({
      level: AlertLevel.Error,
      message: `Failed to save flashcards`,
    });
  } finally {
    res.send({});
  }
};

export default handler;
