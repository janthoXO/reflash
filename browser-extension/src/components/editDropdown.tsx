import { Edit, MoreHorizontal, Trash } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~components/ui/dropdown-menu";
import { Button } from "./ui/button";

interface EditDropdownProps {
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
  onOpenChange?: (open: boolean) => void;
  menuItems?: ReactNode[];
}

export default function EditDropdown({
  onEdit,
  onDelete,
  onOpenChange = () => {},
  menuItems = [],
}: EditDropdownProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {menuItems}
        <DropdownMenuItem
          onSelect={onEdit}
          onClick={(e) => e.stopPropagation()}
        >
          <Edit />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={onDelete}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash className="text-destructive" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
