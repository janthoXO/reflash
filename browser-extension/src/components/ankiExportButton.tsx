import { toast } from "sonner";
import { Button } from "./ui/button";
import { SiAnki } from "@icons-pack/react-simple-icons";
import { useAnki } from "~hooks/useAnki";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type AnkiVersion = "2.1.54+" | "before-2.1.54";

export default function AnkiExportButton() {
  const { exportAnki } = useAnki();
  const [ankiVersion, setAnkiVersion] = useState<AnkiVersion>("2.1.54+");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverAnchor>
        <Tooltip key="export-anki-tooltip">
          <TooltipTrigger asChild>
            <Button variant="secondary" onClick={() => setIsPopoverOpen(true)}>
              <SiAnki />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Flashcards to Anki Format</TooltipContent>
        </Tooltip>
      </PopoverAnchor>

      <PopoverContent className=" w-sm space-y-2 p-2">
        <Label htmlFor="anki-version-select">AnkiVersion</Label>
        <Select
          value={ankiVersion}
          onValueChange={(value) => setAnkiVersion(value as AnkiVersion)}
        >
          <SelectTrigger id="anki-version-select">
            <SelectValue placeholder="Select a version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"2.1.54+"}>2.1.54+</SelectItem>
            <SelectItem value={"before-2.1.54"}>before 2.1.54</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() =>
            exportAnki(ankiVersion === "before-2.1.54").catch(() => {
              toast.error("Failed to export flashcards to Anki format");
            })
          }
        >
          Export
        </Button>
      </PopoverContent>
    </Popover>
  );
}
