import type { Flashcard, Unit } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeleteDialog from "~components/deleteDialog";
import EditDropdown from "~components/editDropdown";
import Header from "~components/header";
import { Button } from "~components/ui/button";
import { Card, CardContent } from "~components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~components/ui/collapsible";
import { Input } from "~components/ui/input";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "~components/ui/input-group";
import { Separator } from "~components/ui/separator";
import { Textarea } from "~components/ui/textarea";
import { db } from "~db/db";
import { fuzzySearch, fuzzySearchAndMap } from "~lib/search";

export default function UnitPage() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // query already saved course for current URL
  const unit = useLiveQuery(async () => {
    if (!courseId || !unitId) return;

    const unit = (await db.units.get({
      id: parseInt(unitId),
      courseId: parseInt(courseId),
    })) as Unit | undefined;

    if (!unit) return undefined;

    setEditName(unit.name);

    unit.cards = await db.flashcards.where({ unitId: unit.id }).toArray();

    return unit;
  }, [unitId, courseId]);

  const flashcards = useMemo(() => {
    if (!unit?.cards || !searchQuery) {
      return unit?.cards ?? [];
    }

    const query = searchQuery.toLowerCase();
    return unit.cards.filter((card) => {
      return (
        fuzzySearch(card.question, query) || fuzzySearch(card.answer, query)
      );
    });
  }, [searchQuery, unit?.cards]);

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
                  key="back-button"
                  variant="ghost"
                  size="icon-sm"
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
                  key="edit-dropdown"
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

      <a
        href={unit.fileUrl}
        target="_blank"
        className="text-muted-foreground hover:underline"
      >
        {unit.fileUrl}
      </a>

      <Input
        placeholder="Search flashcards..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="my-4"
      />
      <div className="space-y-2">
        {flashcards.map((card) => (
          <FlashcardItem
            key={card.id}
            flashcard={card}
            forceExpand={!!searchQuery}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}

function FlashcardItem({
  flashcard,
  forceExpand,
  searchQuery,
}: {
  flashcard: Flashcard;
  forceExpand: boolean;
  searchQuery: string;
}) {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editCard, setEditCard] = useState<{
    question: string;
    answer: string;
  }>({ question: flashcard.question, answer: flashcard.answer });
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (forceExpand) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [forceExpand]);

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
          <Collapsible
            open={isExpanded}
            onOpenChange={setIsExpanded}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer w-full group">
                <p className="text-base text-card-foreground mb-2">
                  {fuzzySearchAndMap(
                    flashcard.question,
                    searchQuery,
                    (word) => (
                      <mark>{word}</mark>
                    ),
                    (word) => (
                      <span>{word}</span>
                    )
                  )}
                </p>
                {!isExpanded && (
                  <div className="flex justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <ChevronDown size={16} />
                  </div>
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator className="my-2" />
              <p className="text-base text-card-foreground">
                {fuzzySearchAndMap(
                  flashcard.answer,
                  searchQuery,
                  (word) => (
                    <mark>{word}</mark>
                  ),
                  (word) => (
                    <span>{word}</span>
                  )
                )}
              </p>
              <div
                className="flex justify-center text-muted-foreground hover:text-primary transition-colors mt-2 cursor-pointer"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp size={16} />
              </div>
            </CollapsibleContent>
          </Collapsible>
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
