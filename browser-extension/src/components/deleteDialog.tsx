import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~components/ui/dialog";
import { Button } from "./ui/button";
import { Trash, X } from "lucide-react";

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
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">
                <X />
                {"Cancel"}
              </Button>
            </DialogClose>
            <Button variant="destructive" type="submit" onClick={onDelete}>
              <Trash />
              {"Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
