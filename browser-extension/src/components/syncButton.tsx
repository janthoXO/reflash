import { FolderSync } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent } from "./ui/popover";
import { useState } from "react";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { useNavigate } from "react-router-dom";

export default function SyncButton() {
  const navigate = useNavigate();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverAnchor>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" onClick={() => setIsPopoverOpen(true)}>
              <FolderSync />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sync Flashcards with mobile app</TooltipContent>
        </Tooltip>
      </PopoverAnchor>

      <PopoverContent className="space-y-2">
        <p className="text-xs">Sync your flashcards with the mobile app.</p>
        <div className="flex flex-row gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/sync?mode=selected")}
          >
            Only selected
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/sync?mode=all")}
          >
            All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
