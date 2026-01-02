import { Edit, Trash } from "lucide-react-native";
import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

interface EditContextmenuProps {
  onEdit: () => void;
  onDelete: () => void;
  menuItems?: ReactNode[];
  children?: ReactNode;
  className?: string;
}

export default function EditContextmenu({
  onEdit,
  onDelete,
  menuItems = [],
  children,
  className,
}: EditContextmenuProps) {
  return (
    <ContextMenu className={className}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {menuItems}
        <ContextMenuItem
          onPress={() => {
            onEdit();
          }}>
          <Icon as={Edit} />
          <Text>Edit</Text>
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onPress={() => {
            onDelete();
          }}>
          <Icon as={Trash} className="text-destructive" />
          <Text>Delete</Text>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
