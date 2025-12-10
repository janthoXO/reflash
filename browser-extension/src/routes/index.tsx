import { BookMarked, FileSearchCorner, Settings } from "lucide-react"
import { useEffect } from "react"
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

import { Button } from "~components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "~components/ui/tabs"
import { useSettings } from "~contexts/SettingsContext"
import { useFiles } from "~hooks/useFiles"
import { useRoute } from "~hooks/useRoute"

import LibraryPage from "./library"
import SettingsPage from "./settings"
import TrainingPage from "./training"

export const Routing = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentRoute, setCurrentRoute } = useRoute()
  const { scanFiles } = useFiles()
  const { settings } = useSettings()

  // Sync route from storage on mount
  useEffect(() => {
    console.debug("Navigating to stored route:", currentRoute)
    if (location.pathname !== currentRoute) {
      navigate(currentRoute)
    }
  }, [])

  // Update storage route on location change
  useEffect(() => {
    console.debug("Updating currentRoute to:", location.pathname)
    setCurrentRoute(location.pathname)
  }, [location.pathname])

  // Determine current tab from path
  const currentTab = location.pathname.substring(1)

  return (
    <div className="w-[400px] min-h-[500px] bg-background flex flex-col p-4">
      <header className="flex justify-between pb-2">
        <h1 className="text-2xl font-bold">
          {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
        </h1>
        {settings.autoScrape ? (
          <Button variant="outline" onClick={() => scanFiles(settings.llm)}>
            <BookMarked />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => scanFiles(settings.llm)}>
            <FileSearchCorner />
          </Button>
        )}
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/training" replace />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <footer>
        <Tabs
          value={currentTab}
          onValueChange={(value) => navigate(`/${value}`)}
          className="w-full">
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
  )
}
