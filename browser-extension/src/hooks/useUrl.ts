import { useEffect, useState } from "react";

export function useUrl() {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(undefined);

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

  return { currentUrl };
}
