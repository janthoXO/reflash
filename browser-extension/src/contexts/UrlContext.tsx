import type { Course } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db } from "~db/db";
import { useCourse } from "~hooks/useCourse";
import { useSettingsStorage } from "~local-storage/settings";

interface UrlContextType {
  currentUrl: string | undefined;
  currentUrlCourse: Course | undefined;
}

const UrlContext = createContext<UrlContextType | null>(null);

export function UrlProvider({ children }: { children: ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(undefined);
  const { settings } = useSettingsStorage();
  const { scanFiles } = useCourse();

  // query already saved course for current URL
  const currentUrlCourse = useLiveQuery(async () => {
    if (!currentUrl) return undefined;
    return await db.courses.get({ url: currentUrl });
  }, [currentUrl]);

  // if autoscrape is enabled, scan files when URL changes to an already tracked course
  useEffect(() => {
    if (!settings.autoScrape || !currentUrlCourse) return;

    scanFiles(currentUrlCourse.id, settings.llm);
  }, [currentUrlCourse, settings.autoScrape]);

  // Listen for active tab URL changes
  useEffect(() => {
    // 1. Get initial URL of the active tab
    const getUrl = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.url) {
        setCurrentUrl(tab.url);
      }
    };
    getUrl();

    // 2. Listen for URL changes (navigation within the tab)
    const handleUpdate = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      // Only update if the active tab's URL changed
      if (changeInfo.url && tab.active) {
        setCurrentUrl(changeInfo.url);
      }
    };

    chrome.tabs.onUpdated.addListener(handleUpdate);
    return () => chrome.tabs.onUpdated.removeListener(handleUpdate);
  }, []);

  return (
    <UrlContext.Provider
      value={{
        currentUrl,
        currentUrlCourse,
      }}
    >
      {children}
    </UrlContext.Provider>
  );
}

export function useUrl() {
  const context = useContext(UrlContext);
  if (!context) {
    throw new Error("useUrl must be used within a UrlProvider");
  }
  return context;
}
