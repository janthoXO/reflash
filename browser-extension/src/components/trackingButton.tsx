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
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "./ui/popover";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { LLMSettings } from "~models/settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { PopoverClose } from "@radix-ui/react-popover";

export default function TrackingButton() {
  const [settings] = useSettingsStorage();
  const { currentUrlCourse } = useUrl();
  const { scanFiles } = useCourse();

  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div>
      {!settings.autoScrape ? (
        <div>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() =>
                      currentUrlCourse
                        ? // only show custom prompt popup if course is not in library yet
                          scanFiles(currentUrlCourse.id, settings.llm)
                        : setPopoverOpen(true)
                    }
                  >
                    <FileSearchCorner />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>Scan this site for new files.</TooltipContent>
              </Tooltip>
            </PopoverAnchor>
            <TrackingButtonDialog
              courseId={currentUrlCourse?.id}
              llmSettings={settings.llm}
              isTracking={false}
            />
          </Popover>
        </div>
      ) : !currentUrlCourse ? (
        <div>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setPopoverOpen(true)}>
                    <BookMarked />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Track this site for new files automatically.
                </TooltipContent>
              </Tooltip>
            </PopoverAnchor>

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
    <PopoverContent className="space-y-2">
      <p className="text-sm">
        {isTracking
          ? "Add the current website to automatic tracking."
          : "Scan the current website for new files."}
      </p>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline">
            <Label htmlFor="custom-prompt" className="text-muted-foreground">
              Custom Prompt
            </Label>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p className="text-xs">
              This can also be adjusted per course in the library
            </p>
            {/* custom prompt will be saved to the course in course-scan background task */}
            <Textarea
              id="custom-prompt"
              value={editCustomPrompt}
              onChange={(e) => setEditCustomPrompt(e.target.value)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex justify-end">
        <PopoverClose asChild>
          <Button
            type="submit"
            onClick={() =>
              isTracking
                ? trackCourse(llmSettings, editCustomPrompt)
                : scanFiles(courseId, llmSettings, editCustomPrompt)
            }
          >
            {isTracking ? "Track" : "Scan"}
          </Button>
        </PopoverClose>
      </div>
    </PopoverContent>
  );
}
