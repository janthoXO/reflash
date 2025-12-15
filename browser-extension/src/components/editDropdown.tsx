import { Edit, MoreHorizontal, Trash } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~components/ui/dropdown-menu";

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
      <DropdownMenuTrigger>
        <MoreHorizontal />
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
