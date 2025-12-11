import SettingsComponent from "~components/settings";
import { useSettings } from "~contexts/SettingsContext";

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  return (
    <div>
      <SettingsComponent settings={settings} setSettings={setSettings} />
    </div>
  );
}
