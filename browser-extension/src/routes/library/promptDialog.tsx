import type { Course } from "@reflash/shared";
import { Check, X } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "~components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~components/ui/dialog";
import { Textarea } from "~components/ui/textarea";
import { usePromptStorage } from "~local-storage/prompts";

export default function PromptDialog({
  course,
  open,
  setOpen,
}: {
  course: Course;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {open && <PromptDialogContent course={course} setOpen={setOpen} />}
      </Dialog>
    </>
  );
}

function PromptDialogContent({
  course,
  setOpen,
}: {
  course: Course;
  setOpen: (open: boolean) => void;
}) {
  const [customPrompt, setCustomPrompt, { isLoading }] = usePromptStorage(
    course.id
  );
  const [editPrompt, setEditPrompt] = useState<string>("");

  useEffect(() => {
    if (customPrompt) {
      setEditPrompt(customPrompt);
    }
  }, [customPrompt]);

  function onSubmit() {
    setCustomPrompt(editPrompt);
    setOpen(false);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{`Adjust Prompt for ${course.name}`}</DialogTitle>
      </DialogHeader>
      {isLoading ? (
        <div className="py-4">Loading...</div>
      ) : (
        <Textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          placeholder="Enter custom prompt..."
          className="min-h-[100px]"
        />
      )}
      <DialogFooter>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">
              <X />
              {"Cancel"}
            </Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit}>
            <Check />
            {"Save"}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
