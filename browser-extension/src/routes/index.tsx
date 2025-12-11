import { useLiveQuery } from "dexie-react-hooks";
import { BookMarked, FileSearchCorner, Settings } from "lucide-react";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Button } from "~components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~components/ui/tooltip";
import { useSettings } from "~contexts/SettingsContext";
import { db } from "~db/db";
import { useCourse } from "~hooks/useCourse";
import { useTabs } from "~hooks/useTabs";
import { useUrl } from "~hooks/useUrl";

import LibraryPage from "./library";
import SettingsPage from "./settings";
import TrainingPage from "./training";

export const Routing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTab, setCurrentTab } = useTabs();
  const { scanFiles, trackCourse } = useCourse();
  const { settings } = useSettings();
  const { currentUrl } = useUrl();

  // Sync route from storage on mount
  useEffect(() => {
    console.debug("Navigating to stored route:", currentTab);
    if (location.pathname !== currentTab) {
      navigate(currentTab);
    }
  }, []);

  // Update storage route on location change
  useEffect(() => {
    console.debug("Updating currentRoute to:", location.pathname);
    setCurrentTab(location.pathname);
  }, [location.pathname]);

  // Fetch due cards
  const currentUrlCourse = useLiveQuery(async () => {
    return await db.courses.get({ url: currentUrl });
  }, [currentUrl]);

  // if autoscrape is enabled, scan files when URL changes to an already tracked course
  useEffect(() => {
    if (!settings.autoScrape || !currentUrlCourse) return;

    scanFiles(settings.llm);
  }, [currentUrlCourse, settings.autoScrape]);

  return (
    <div className="w-[400px] min-h-[500px] bg-background flex flex-col p-4">
      <header className="flex justify-between pb-2">
        <TooltipProvider>
          <h1 className="text-2xl font-bold">
            {currentTab.charAt(1).toUpperCase() + currentTab.slice(2)}
          </h1>
          {!settings.autoScrape ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => scanFiles(settings.llm)}
                >
                  <FileSearchCorner />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Scan this site for new files.
              </TooltipContent>
            </Tooltip>
          ) : !currentUrlCourse ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => trackCourse(settings.llm)}
                >
                  <BookMarked />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Track this site for new files automatically.
              </TooltipContent>
            </Tooltip>
          ) : null}
        </TooltipProvider>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/training" />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <footer>
        <Tabs
          value={currentTab.slice(1)}
          onValueChange={(value) => navigate(`/${value}`)}
          className="w-full"
        >
          <TabsList className="w-full flex flex-wrap">
            <TabsTrigger value="training" className="flex-1">
              Training
            </TabsTrigger>
            <TabsTrigger value="library" className="flex-1">
              Library
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              <Settings />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </footer>
    </div>
  );
};
