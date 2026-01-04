import type { PlasmoMessaging } from "@plasmohq/messaging";
import { alertPopup } from "~background/alertManager";
import { db } from "~db/db";
import z from "zod";
import { AlertLevel } from "~models/alert";

const RequestSchema = z.object({
  courseId: z.number(),
  unitId: z.number(),
});

type RequestType = z.infer<typeof RequestSchema>;

// used to delete a unit from the offscreen in case of errors during generation
const handler: PlasmoMessaging.MessageHandler<
  RequestType,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "units-delete") return;

  console.debug("[Background: units-delete] received request\n", req.body);

  try {
    const reqBody = RequestSchema.parse(req.body);

    const now = Date.now();
    await db.units.update(reqBody.unitId, {
      deletedAt: now,
      updatedAt: now,
      isGenerating: false,
    });
    res.send({});
    return;
  } catch (e) {
    console.error("[Background: units-delete] Error:", e);
    await alertPopup({
      level: AlertLevel.Error,
      message: `Failed to delete unit`,
    });
  } finally {
    res.send({});
  }
};

export default handler;
