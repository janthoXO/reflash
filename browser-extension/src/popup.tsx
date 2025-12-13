import "./style.css";

import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "~components/ui/sonner";
import { TooltipProvider } from "~components/ui/tooltip";

import { SettingsProvider } from "~contexts/SettingsContext";
import { UrlProvider } from "~contexts/UrlContext";
import { db, populateMockData } from "~db/db";
import { Routing } from "~routes";

function IndexPopup() {
  useEffect(() => {
    // Uncomment to populate mock data on startup
    populateMockData(db);
  }, []);

  return (
    <div>
      <SettingsProvider>
        <UrlProvider>
          <TooltipProvider>
            <MemoryRouter>
              <Routing />
            </MemoryRouter>
          </TooltipProvider>
        </UrlProvider>
      </SettingsProvider>
      <Toaster closeButton/>
    </div>
  );
}

export default IndexPopup;
