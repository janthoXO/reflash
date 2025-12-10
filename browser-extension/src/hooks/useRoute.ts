import { useStorage } from "@plasmohq/storage/hook"

export function useRoute() {
  const [currentRoute, setCurrentRoute] = useStorage<string>("route", (v) => v || "/")

  return { currentRoute, setCurrentRoute }
}
