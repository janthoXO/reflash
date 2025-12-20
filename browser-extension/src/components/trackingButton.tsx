import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~components/ui/tooltip";
import { Button } from "~components/ui/button";
import { useCourse } from "~hooks/useCourse";
import { BookMarked, FileSearchCorner } from "lucide-react";
import { useUrl } from "~contexts/UrlContext";
import { useSettingsStorage } from "~local-storage/settings";
import { getPromptFromStorage } from "~local-storage/prompts";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "./ui/popover";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { LLMSettings } from "~models/settings";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export default function TrackingButton() {
  const [settings] = useSettingsStorage();
  const { currentUrlCourse } = useUrl();
  const { scanFiles, trackCourse } = useCourse();

  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const onFocus = () => {
      console.log("Focus moved to: ", document.activeElement);
    };

    // 'focusin' bubbles, 'focus' does not. Use focusin to catch everything.
    document.addEventListener("focusin", onFocus);

    return () => document.removeEventListener("focusin", onFocus);
  }, []);

  return (
    <div>
      {!settings.autoScrape ? (
        <div>
          <ContextMenu>
            <Tooltip>
              <ContextMenuTrigger>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() =>
                      scanFiles(currentUrlCourse?.id, settings.llm)
                    }
                  >
                    <FileSearchCorner />
                  </Button>
                </TooltipTrigger>
              </ContextMenuTrigger>

              <TooltipContent>
                Scan this site for new files.
                <br /> Right Click for Custom Prompts
              </TooltipContent>
            </Tooltip>

            <ContextMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              <ContextMenuItem
                onSelect={() => scanFiles(currentUrlCourse?.id, settings.llm)}
              >
                Scan
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => {
                  setTimeout(() => {
                    setPopoverOpen(true);
                  }, 200);
                }}
              >
                Scan with Custom Prompt
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor />
            <TrackingButtonDialog
              courseId={currentUrlCourse?.id}
              llmSettings={settings.llm}
              isTracking={false}
            />
          </Popover>
        </div>
      ) : !currentUrlCourse ? (
        <div>
          <ContextMenu>
            <Tooltip>
              <ContextMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button onClick={() => trackCourse(settings.llm)}>
                    <BookMarked />
                  </Button>
                </TooltipTrigger>
              </ContextMenuTrigger>
              <TooltipContent>
                Track this site for new files automatically.
                <br /> Right Click for Custom Prompts
              </TooltipContent>
            </Tooltip>
            <ContextMenuContent
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              <ContextMenuItem onSelect={() => trackCourse(settings.llm)}>
                Track
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => {
                  setTimeout(() => {
                    setPopoverOpen(true);
                  }, 200);
                }}
              >
                Track with Custom Prompt
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor />
            <TrackingButtonDialog
              courseId={undefined}
              llmSettings={settings.llm}
              isTracking={true}
            />
          </Popover>
        </div>
      ) : null}
    </div>
  );
}

function TrackingButtonDialog({
  courseId,
  llmSettings,
  isTracking,
}: {
  courseId: number | undefined;
  llmSettings: LLMSettings;
  isTracking: boolean;
}) {
  const { scanFiles, trackCourse } = useCourse();
  const [editCustomPrompt, setEditCustomPrompt] = useState<string>("");

  useEffect(() => {
    if (!courseId) setEditCustomPrompt("");

    getPromptFromStorage(courseId).then((prompt) =>
      setEditCustomPrompt(prompt ?? "")
    );
  }, [courseId]);

  return (
    <PopoverContent
      className="space-y-2"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      <Label htmlFor="custom-prompt">Custom Prompt</Label>
      <Textarea
        id="custom-prompt"
        value={editCustomPrompt}
        onChange={(e) => setEditCustomPrompt(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          onClick={() =>
            isTracking
              ? trackCourse(llmSettings)
              : scanFiles(courseId, llmSettings)
          }
        >
          {isTracking ? "Track" : "Scan"}
        </Button>
      </div>
    </PopoverContent>
  );
}
