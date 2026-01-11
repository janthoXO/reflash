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
  const [_alert, _setAlert, { isLoading }] = useStorage<Alert | null>({
    key: _alertStorageKey,
    instance: alertStorageInstance(),
  });

  const setAlert = (
    value:
      | Alert
      | null
      | ((prev?: Alert | null | undefined) => Alert | null | undefined)
  ) => {
    if (typeof value === "function") {
      _setAlert((prev) => {
        const next = value(prev);
        if (!next) {
          return null;
        }
        return { ...next, timestamp: new Date().getTime() };
      });
    } else {
      _setAlert(value ? { ...value, timestamp: new Date().getTime() } : null);
    }
  };

  return { alert: _alert, setAlert, isLoading } as const;
};

export const getAlertFromStorage = async () => {
  return alertStorageInstance().get<Alert | null>(_alertStorageKey);
};

export const setAlertToStorage = (alert: Alert | null) => {
  return alertStorageInstance().set(
    _alertStorageKey,
    alert
      ? {
          ...alert,
          timestamp: new Date().getTime(),
        }
      : null
  );
};
