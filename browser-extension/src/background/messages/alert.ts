import type { PlasmoMessaging } from "@plasmohq/messaging";
import z from "zod";
import { alertPopup } from "~background/alertManager";
import { AlertSchema } from "~models/alert";

const RequestSchema = z.object({
  alert: AlertSchema,
});

type RequestType = z.infer<typeof RequestSchema>;

// receives an alert from the offscreen document and forwards it to the popup
const handler: PlasmoMessaging.MessageHandler<
  RequestType,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "alert") return;

  try {
    const reqBody = RequestSchema.parse(req.body);

    await alertPopup(reqBody.alert);
  } catch (e) {
    console.error("[Background: alert] Error handling alert message:", e);
  } finally {
    res.send({});
  }
};

export default handler;
