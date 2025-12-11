import Header from "~components/header";
import SettingsComponent from "~components/settings";
import TrackingButton from "~components/trackingButton";
import { useSettings } from "~contexts/SettingsContext";

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  return (
    <div>
      <Header title="Settings" suffix={[<TrackingButton key="settings-tracking-button" />]} />
      <SettingsComponent settings={settings} setSettings={setSettings} />
    </div>
  );
}
