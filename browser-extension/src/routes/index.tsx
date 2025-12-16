import { Settings } from "lucide-react";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "~components/ui/tabs";

import LibraryPage from "./library";
import SettingsPage from "./settings";
import TrainingPage from "./training";
import { SelectedProvider } from "~contexts/SelectedContext";
import UnitPage from "./library/unit";
import { getRouteFromStorage, useRouteStorage } from "~local-storage/routes";

export const Routing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [route, setRoute] = useRouteStorage();

  // Sync route from storage on mount
  useEffect(() => {
    // do not use the hook as it may still be loading and having an empty route on mount
    getRouteFromStorage().then((route) => {
      console.debug("Navigating to stored route:", route);
      navigate(route);
    });
  }, []);

  // Update storage route on location change
  useEffect(() => {
    if (location.pathname === route) return;

    console.debug("Updating currentRoute to:", location.pathname);
    setRoute(location.pathname);
  }, [location.pathname]);

  return (
    <div className="w-[400px] min-h-[500px] bg-background flex flex-col p-4">
      <div className="flex-1 flex flex-col">
        <SelectedProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/training" />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/courses/:courseId/units/:unitId"
              element={<UnitPage />}
            />
          </Routes>
        </SelectedProvider>
      </div>

      <footer>
        <Tabs
          value={route.slice(1)}
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
