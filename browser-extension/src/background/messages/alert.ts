import type { PlasmoMessaging } from "@plasmohq/messaging";
import { setAlertToStorage } from "~local-storage/alert";

// receives an alert from the offscreen document and forwards it to the popup
const handler: PlasmoMessaging.MessageHandler<
  { alert: Alert },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
> = async (req, res) => {
  setAlertToStorage(req.body.alert);
  res.send({});
};

export default handler
