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
  TooltipTrigger,
} from "~components/ui/tooltip";
import {
  LLMProvider,
  OLLAMA_DEFAULT_URL,
  ProvidersToModels,
} from "~models/settings";
import { LLMModel, type Settings } from "~models/settings";
import { Badge } from "~components/ui/badge";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Separator } from "./ui/separator";

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
    // set default url for ollama if not set
    let url = settings.llm.url;
    if (value === LLMProvider.OLLAMA && settings.llm.url === "") {
      url = OLLAMA_DEFAULT_URL;
    }

    // check if current model is valid for new provider
    let model = settings.llm.model;
    if (
      ProvidersToModels[value].map((m) => m.toString()).includes(model) ===
      false
    ) {
      model = ProvidersToModels[value][0]!;
    }

    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        provider: value,
        url: url,
        model: model,
      },
    });
  };

  const [showApiKey, setShowApiKey] = useState(false);

  const handleApiKeyChange = (apiKey: string) => {
    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        apiKey: apiKey,
      },
    });
  };

  const handleUrlChange = (url: string) => {
    if (url.trim() === "") {
      url = OLLAMA_DEFAULT_URL;
    }

    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        url: url,
      },
    });
  };

  const handleModelChange = (value: string) => {
    setSettings({
      ...settings,
      llm: {
        ...settings.llm,
        model: value,
      },
    });
  };

  return (
    <div className="pt-4 flex-1 flex flex-col overflow-y-auto">
      <div className="flex-1 space-y-6">
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
          <Separator className="my-4" />
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
                {Object.values(LLMProvider).map((provider) => (
                  <SelectItem value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pl-2">
            {settings.llm.provider !== LLMProvider.WASM &&
              settings.llm.provider !== LLMProvider.OLLAMA && (
                <div className="flex flex-row items-center gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your API Key"
                    value={settings.llm.apiKey || ""}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    onFocus={() => setShowApiKey(true)}
                    onBlur={() => setShowApiKey(false)}
                  />
                </div>
              )}
            {settings.llm.provider === LLMProvider.OLLAMA && (
              <div className="flex flex-row items-center gap-2">
                <Label htmlFor="url">Url</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="Enter your URL"
                  value={settings.llm.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
              </div>
            )}
            {ProvidersToModels[settings.llm.provider]?.length > 1 && (
              <div className="flex flex-row items-center justify-between">
                <Label htmlFor="llm-model">LLM Model</Label>
                <Select
                  value={
                    ProvidersToModels[settings.llm.provider].includes(
                      settings.llm.model as LLMModel
                    )
                      ? settings.llm.model
                      : LLMModel.CUSTOM
                  }
                  onValueChange={handleModelChange}
                >
                  <SelectTrigger id="llm-model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ProvidersToModels[settings.llm.provider].map((model) => (
                      <SelectItem value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(settings.llm.model === LLMModel.CUSTOM ||
              !ProvidersToModels[settings.llm.provider].includes(
                settings.llm.model as LLMModel
              )) && (
              <div className="flex flex-row items-center gap-2">
                <Label htmlFor="custom-model">Model Id</Label>
                <Input
                  id="custom-model"
                  type="text"
                  placeholder="Enter the Model Id"
                  value={settings.llm.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Badge variant="outline">
          <a
            href="https://github.com/janthoxo/reflash"
            target="_blank"
            className="flex items-center gap-1 hover:underline"
          >
            <SiGithub />
            Github
          </a>
        </Badge>
      </div>
    </div>
  );
}
