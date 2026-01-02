import { setAlertToStorage } from "~local-storage/alert";
import type { Alert } from "~models/alert";

export async function alertPopup(alert: Alert): Promise<void> {
  return setAlertToStorage(alert).then(() => Promise.resolve());
}
