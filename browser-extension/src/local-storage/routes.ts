import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

const defaultRoute = "/";

const _routeStorageKey = "route";

let _routeStorageInstance: Storage | null = null;

export const routeStorageInstance = () => {
  if (!_routeStorageInstance) {
    _routeStorageInstance = new Storage({
      area: "local",
    });
  }
  return _routeStorageInstance;
};

export const useRouteStorage = () => {
  const [_route, setRoute, { isLoading }] = useStorage<string>({
    key: _routeStorageKey,
    instance: routeStorageInstance(),
  });

  return [_route || defaultRoute, setRoute, isLoading] as const;
};

export const getRouteFromStorage = async () => {
  return routeStorageInstance()
    .get<string>(_routeStorageKey)
    .then((route) => {
      return route || defaultRoute;
    });
};

export const setRouteToStorage = (route: string) => {
  return routeStorageInstance().set(_routeStorageKey, route);
};
