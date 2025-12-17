import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import type { Alert } from "~models/alert";

const _alertStorageKey = "alert";

let _alertStorageInstance: Storage | null = null;

export const alertStorageInstance = () => {
  if (!_alertStorageInstance) {
    _alertStorageInstance = new Storage({
      area: "local",
    });
  }

  return _alertStorageInstance;
};

export const useAlertStorage = () => {
  const [_alert, _setAlert, { isLoading }] = useStorage<Alert>({
    key: _alertStorageKey,
    instance: alertStorageInstance(),
  });

  const setAlert = (alert: Alert) => {
    _setAlert({ ...alert, timestamp: new Date().getTime() });
  };

  return [_alert, setAlert, isLoading] as const;
};

export const getAlertFromStorage = async () => {
  return alertStorageInstance().get<Alert>(_alertStorageKey);
};

export const setAlertToStorage = (alert: Alert) => {
  return alertStorageInstance().set(_alertStorageKey, {
    ...alert,
    timestamp: new Date().getTime(),
  });
};
