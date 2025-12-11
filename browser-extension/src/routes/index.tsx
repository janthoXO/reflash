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

import { Tabs, TabsList, TabsTrigger } from "~components/ui/tabs";
import { TooltipProvider } from "~components/ui/tooltip";
import { useTabs } from "~hooks/useTabs";

import LibraryPage from "./library";
import SettingsPage from "./settings";
import TrainingPage from "./training";
import TrackingButton from "~components/trackingButton";
import Header from "~components/header";
import { SelectedProvider } from "~contexts/SelectedContext";

export const Routing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTab, setCurrentTab } = useTabs();

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

  return (
    <div className="w-[400px] min-h-[500px] bg-background flex flex-col p-4">
      <div className="flex-1">
        <SelectedProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/training" />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </SelectedProvider>
      </div>

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
