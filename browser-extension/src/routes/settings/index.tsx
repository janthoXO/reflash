import Header from "~components/header";
import SettingsComponent from "~components/settings";
import TrackingButton from "~components/trackingButton";
import { useSettingsStorage } from "~local-storage/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useSettingsStorage();

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Settings"
        suffix={[<TrackingButton key="settings-tracking-button" />]}
      />
      <SettingsComponent settings={settings} setSettings={setSettings} />
    </div>
  );
}
