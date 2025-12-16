import "./style.css";

import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "~components/ui/sonner";
import { TooltipProvider } from "~components/ui/tooltip";

import { UrlProvider } from "~contexts/UrlContext";
import { db, populateMockData } from "~db/db";
import { useSettingsStorage } from "~local-storage/settings";
import { Routing } from "~routes";

function IndexPopup() {
  useEffect(() => {
    // Uncomment to populate mock data on startup
    populateMockData(db);
  }, []);

  const [settings] = useSettingsStorage();

  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.darkMode]);

  return (
    <div>
      <UrlProvider>
        <TooltipProvider>
          <MemoryRouter>
            <Routing />
          </MemoryRouter>
        </TooltipProvider>
      </UrlProvider>
      <Toaster closeButton />
    </div>
  );
}

export default IndexPopup;
