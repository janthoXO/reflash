import { Trash, X } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Icon } from "./ui/icon";
import { Text } from "./ui/text";

interface DeleteDialogProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  title: string;
  description?: string;
  onDelete: () => void;
}

export default function DeleteDialog({
  open,
  setOpen,
  title,
  description,
  onDelete,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description} </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <View className="flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">
                <Icon as={X} />
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <Button variant="destructive" onPress={onDelete}>
              <Icon as={Trash} />
              <Text>Delete</Text>
            </Button>
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
