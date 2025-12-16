import "./style.css";

import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "~components/ui/sonner";
import { TooltipProvider } from "~components/ui/tooltip";

import { UrlProvider } from "~contexts/UrlContext";
import { db, populateMockData } from "~db/db";
import { useAlertStorage } from "~local-storage/alert";
import { useSettingsStorage } from "~local-storage/settings";
import { Routing } from "~routes";

function IndexPopup() {
  useEffect(() => {
    // Uncomment to populate mock data on startup
    populateMockData(db);
  }, []);

  const [settings] = useSettingsStorage();
  const [alert] = useAlertStorage();

  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.darkMode]);

  useEffect(() => {
    if (!alert) return;

    switch (alert.level) {
      case "info": {
        toast.info(alert.message);
        break;
      }
      case "success": {
        toast.success(alert.message);
        break;
      }
      case "warning": {
        toast.warning(alert.message);
        break;
      }
      case "error": {
        toast.error(alert.message);
        break;
      }
    }
  }, [alert]);

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
