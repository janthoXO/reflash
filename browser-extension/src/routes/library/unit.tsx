import type { Flashcard, Unit } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Check, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeleteDialog from "~components/deleteDialog";
import EditDropdown from "~components/editDropdown";
import Header from "~components/header";
import { Button } from "~components/ui/button";
import { Card, CardContent } from "~components/ui/card";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "~components/ui/input-group";
import { Separator } from "~components/ui/separator";
import { Textarea } from "~components/ui/textarea";
import { db } from "~db/db";

export default function UnitPage() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  // query already saved course for current URL
  const unit = useLiveQuery(async () => {
    if (!courseId || !unitId) return;

    const unit = (await db.units.get({
      id: parseInt(unitId),
      courseId: parseInt(courseId),
    })) as Unit;

    if (unit) {
      setEditName(unit.name);
    }

    unit.cards = (await db.flashcards
      .where({ unitId: unit.id })
      .toArray()) as Flashcard[];

    return unit;
  }, [unitId, courseId]);

  function onSave() {
    unit!.name = editName;
    db.units.update(unit!.id, { name: editName });
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditName(unit!.name);
  }

  function onDelete() {
    db.units.delete(unit!.id);
    db.flashcards.where({ unitId: unit!.id }).delete();
    setShowDeleteDialog(false);
  }

  if (!unit) {
    return null;
  }

  return (
    <div>
      <Header
        title={
          isEdit ? (
            <InputGroup>
              <InputGroupInput
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <InputGroupButton
                variant="ghost"
                type="reset"
                onClick={() => onReset()}
              >
                <X className="text-destructive" />
              </InputGroupButton>
              <InputGroupButton
                type="submit"
                variant="ghost"
                onClick={() => onSave()}
              >
                <Check className="text-success" />
              </InputGroupButton>
            </InputGroup>
          ) : (
            `${unit?.name ?? "Unknown"}`
          )
        }
        prefix={
          isEdit
            ? []
            : [
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  <ArrowLeft />
                </Button>,
              ]
        }
        suffix={
          isEdit
            ? []
            : [
                <EditDropdown
                  onEdit={() => setIsEdit(true)}
                  onDelete={() => setShowDeleteDialog(true)}
                />,
              ]
        }
      />

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting ${unit.name}`}
        description={`Are you sure you want to delete the unit ${unit.name} with all its flashcards?`}
        onDelete={onDelete}
      />

      <div className="space-y-2">
        <a
          href={unit.fileUrl}
          target="_blank"
          className="text-muted-foreground hover:underline"
        >
          {unit.fileUrl}
        </a>

        {unit.cards?.map((card) => (
          <FlashcardItem flashcard={card} />
        ))}
      </div>
    </div>
  );
}

function FlashcardItem({ flashcard }: { flashcard: Flashcard }) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editCard, setEditCard] = useState<{
    question: string;
    answer: string;
  }>({ question: flashcard.question, answer: flashcard.answer });
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  function onSave() {
    flashcard.question = editCard.question;
    flashcard.answer = editCard.answer;
    db.flashcards.update(flashcard.id, {
      question: editCard.question,
      answer: editCard.answer,
    });
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditCard({ question: flashcard.question, answer: flashcard.answer });
  }

  function onDelete() {
    db.flashcards.delete(flashcard.id);
    setShowDeleteDialog(false);
  }

  return (
    <Card
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isEdit && (isHovered || isDropdownOpen) && (
        <div className="absolute top-2 right-2 z-10">
          <EditDropdown
            onEdit={() => setIsEdit(true)}
            onDelete={() => setShowDeleteDialog(true)}
            onOpenChange={setIsDropdownOpen}
          />
        </div>
      )}
      <CardContent className="flex justify-center items-center text-center align-middle">
        {isEdit ? (
          <div className="flex-1 space-y-2">
            <Textarea
              value={editCard.question}
              onChange={(e) =>
                setEditCard((prev) => ({ ...prev, question: e.target.value }))
              }
            />
            <Separator />
            <Textarea
              value={editCard.answer}
              onChange={(e) =>
                setEditCard((prev) => ({ ...prev, answer: e.target.value }))
              }
            />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onReset}>
                <X className="text-destructive" />
              </Button>
              <Button variant="ghost" onClick={onSave}>
                <Check className="text-success" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base text-card-foreground">
              {flashcard.question}
            </p>
            <Separator />
            <p className="text-base text-card-foreground">{flashcard.answer}</p>
          </div>
        )}
      </CardContent>

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting Flashcard`}
        description={`Are you sure you want to delete this flashcard?`}
        onDelete={onDelete}
      />
    </Card>
  );
}
