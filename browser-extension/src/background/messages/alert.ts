import type { PlasmoMessaging } from "@plasmohq/messaging";
import { alertPopup } from "~background/alertManager";
import type { Alert } from "~models/alert";

// receives an alert from the offscreen document and forwards it to the popup
const handler: PlasmoMessaging.MessageHandler<
  { alert: Alert },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  if (req.name !== "alert") return;

  await alertPopup(req.body.alert);
  res.send({});
};

export default handler;
