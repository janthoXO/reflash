import { CircleQuestionMark } from "lucide-react";
import { useState } from "react";

import { Input } from "~components/ui/input";
import { Label } from "~components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~components/ui/select";
import { Switch } from "~components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~components/ui/tooltip";
import { LLMProvider } from "~models/ai-providers";
import type { Settings } from "~models/settings";

interface SettingsProps {
  settings: Settings;
  setSettings: (setter: Settings) => Promise<void>;
}

export default function SettingsComponent({
  settings,
  setSettings,
}: SettingsProps) {
  const handleDarkModeChange = (checked: boolean) => {
    setSettings({ ...settings, darkMode: checked });
  };

  const handleAutoScrapeChange = (checked: boolean) => {
    setSettings({ ...settings, autoScrape: checked });
  };

  const handleProviderChange = (value: LLMProvider) => {
    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        provider: value,
      },
    });
  };

  const [showApiKey, setShowApiKey] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        apiKey: e.target.value,
      },
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        url: e.target.value,
      },
    });
  };

  return (
    <div className="space-y-6 p-4">
      <TooltipProvider>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleQuestionMark
                  size={16}
                  className="text-muted-foreground"
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-[20em]" side="right">
                Toggle dark mode for the extension interface.
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="dark-mode"
            checked={settings.darkMode}
            onCheckedChange={handleDarkModeChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Label htmlFor="auto-scrape">Auto Scan</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleQuestionMark
                  size={16}
                  className="text-muted-foreground"
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-[20em]" side="right">
                Automatically scan for new files when visiting an already added
                course.
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="auto-scrape"
            checked={settings.autoScrape}
            onCheckedChange={handleAutoScrapeChange}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-row items-center justify-between">
            <Label htmlFor="llm-provider">LLM Provider</Label>
            <Select
              value={settings.llm.provider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger id="llm-provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LLMProvider.WASM}>Default Local</SelectItem>
                <SelectItem value={LLMProvider.OPENAI}>OpenAI</SelectItem>
                <SelectItem value={LLMProvider.GOOGLE}>
                  Google Gemini
                </SelectItem>
                <SelectItem value={LLMProvider.ANTHROPIC}>Anthropic</SelectItem>
                <SelectItem value={LLMProvider.OLLAMA}>Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.llm.provider !== LLMProvider.WASM && (
            <div className="pl-2 space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your API Key"
                value={settings.llm.apiKey || ""}
                onChange={handleApiKeyChange}
                onFocus={() => setShowApiKey(true)}
                onBlur={() => setShowApiKey(false)}
              />
            </div>
          )}
          {settings.llm.provider === LLMProvider.OLLAMA && (
            <div className="pl-2 space-y-2">
              <Label htmlFor="url">Url</Label>
              <Input
                id="url"
                type="text"
                placeholder="Enter your URL"
                value={settings.llm.url || ""}
                onChange={handleUrlChange}
              />
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
