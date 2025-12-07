import { Settings } from "lucide-react"
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom"

import { Tabs, TabsList, TabsTrigger } from "~components/ui/tabs"

import LibraryPage from "./library"
import SettingsPage from "./settings"
import TrainingPage from "./training"

export const Routing = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine current tab from path
  const currentTab = location.pathname.substring(1) || "training"

  return (
    <div className="w-[400px] min-h-[500px] bg-background flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/training" replace />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>

      <footer>
        <Tabs
          value={currentTab}
          onValueChange={(value) => navigate(`/${value}`)}
          className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full flex flex-wrap">
              <TabsTrigger value="training" className="flex-1">Training</TabsTrigger>
              <TabsTrigger value="library" className="flex-1">Library</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings />
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </footer>
    </div>
  )
}
