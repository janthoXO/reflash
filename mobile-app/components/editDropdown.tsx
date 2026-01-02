import { Edit, MoreHorizontal, Trash } from "lucide-react-native";
import { ReactNode } from "react";
import { GestureResponderEvent } from "react-native";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

interface EditDropdownProps {
  onEdit: (e: GestureResponderEvent) => void;
  onDelete: (e: GestureResponderEvent) => void;
  menuItems?: ReactNode[];
}

export default function EditDropdown({ onEdit, onDelete, menuItems = [] }: EditDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Icon as={MoreHorizontal} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {menuItems}
        <DropdownMenuItem
          onPress={(e) => {
            onEdit(e);
            e.stopPropagation();
          }}>
          <Icon as={Edit} />
          <Text>Edit</Text>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onPress={(e) => {
            onDelete(e);
            e.stopPropagation();
          }}>
          <Icon as={Trash} className="text-destructive" />
          <Text>Delete</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
