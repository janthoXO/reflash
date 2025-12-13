import { Edit, MoreHorizontal, Trash } from "lucide-react";
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
}

export default function EditDropdown({
  onEdit,
  onDelete,
  onOpenChange = () => {},
}: EditDropdownProps) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
