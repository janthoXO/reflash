import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

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
  const [_alert, setAlert, { isLoading }] = useStorage<Alert>({
    key: _alertStorageKey,
    instance: alertStorageInstance(),
  });

  return [_alert, setAlert, isLoading] as const;
};

export const getAlertFromStorage = async () => {
  return alertStorageInstance().get<Alert>(_alertStorageKey);
};

export const setAlertToStorage = (alert: Alert) => {
  return alertStorageInstance().set(_alertStorageKey, alert);
};
