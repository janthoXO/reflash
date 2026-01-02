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

export default function TrackingButton() {
  const { settings } = useSettingsStorage();
  const { currentUrlCourse } = useUrl();
  const { scanFiles, trackCourse } = useCourse();

  return (
    <div>
      {!settings.autoScrape ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => scanFiles(currentUrlCourse?.id, settings.llm)}
            >
              <FileSearchCorner />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Scan this site for new files.</TooltipContent>
        </Tooltip>
      ) : !currentUrlCourse ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => trackCourse(undefined, settings.llm)}>
              <BookMarked />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Track this site for new files automatically.
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
