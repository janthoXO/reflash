import { useStorage } from "@plasmohq/storage/hook"

export function useTabs() {
  const [currentTab, setCurrentTab] = useStorage<string>("route", (v) => v || "/")

  return { currentTab, setCurrentTab }
}
