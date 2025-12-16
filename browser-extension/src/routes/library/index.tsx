import { SiAnki } from "@icons-pack/react-simple-icons";
import type { Course, Unit } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DeleteDialog from "~components/deleteDialog";
import EditDropdown from "~components/editDropdown";
import Header from "~components/header";
import TrackingButton from "~components/trackingButton";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~components/ui/accordion";
import { Button } from "~components/ui/button";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "~components/ui/input-group";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~components/ui/tooltip";
import { useSelected } from "~contexts/SelectedContext";
import { db } from "~db/db";
import PromptDialog from "./promptDialog";
import { DropdownMenuItem } from "~components/ui/dropdown-menu";

export default function LibraryPage() {
  const courses = useLiveQuery(async () => {
    const courses = (await db.courses.toArray()) as Course[];
    for (const course of courses) {
      course.units = (await db.units
        .where({ courseId: course.id })
        .toArray()) as Unit[];
    }
    return courses;
  }) as Course[] | undefined;

  const { isLoading: isSelectionLoading } = useSelected();

  if (!courses || isSelectionLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Library"
        suffix={[
          <Tooltip key="export-anki-tooltip">
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                onClick={() => {
                  toast.warning("Export to Anki not implemented yet.");
                }}
              >
                <SiAnki />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Flashcards to Anki Format</TooltipContent>
          </Tooltip>,
          <TrackingButton key="library-tracking-button" />,
        ]}
      />
      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses found.</p>
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {courses.map((course) => {
            return <CourseItem key={course.id} course={course} />;
          })}
        </Accordion>
      )}
    </div>
  );
}

function CourseItem({ course }: { course: Course }) {
  const { isCourseSelected, isUnitSelected, toggleCourse, toggleUnit } =
    useSelected();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(course.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showPromptDialog, setShowPromptDialog] = useState<boolean>(false);

  function onSave() {
    course.name = editName;
    db.courses.update(course.id, { name: editName });
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditName(course.name);
  }

  function onDelete() {
    db.courses.delete(course.id);
    db.units.where({ courseId: course.id }).delete();
    db.flashcards
      .where("unitId")
      .anyOf(course.units?.map((u) => u.id) ?? [])
      .delete();
    setShowDeleteDialog(false);
  }

  return (
    <AccordionItem
      value={course.id.toString()}
      className="border rounded-lg px-4 bg-card text-card-foreground shadow-sm"
    >
      {/* Accordion Header */}
      {isEdit ? (
        <div className="flex py-2">
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
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCourseSelected(course.id)}
            onChange={() => toggleCourse(course)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <AccordionTrigger className="hover:no-underline">
              <div className="font-semibold text-left truncate">
                {course.name}
              </div>
            </AccordionTrigger>
          </div>
          <EditDropdown
            onEdit={() => setIsEdit(true)}
            onDelete={() => setShowDeleteDialog(true)}
            menuItems={[
              <DropdownMenuItem
                key="prompt-dropdown-button"
                onSelect={() => {
                  setShowPromptDialog(true);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Edit Prompt
              </DropdownMenuItem>,
            ]}
          />
          <PromptDialog
            course={course}
            open={showPromptDialog}
            setOpen={setShowPromptDialog}
          />
        </div>
      )}

      <AccordionContent className="space-y-2">
        <a
          href={course.url}
          target="_blank"
          className="text-muted-foreground hover:underline"
        >
          {course.url}
        </a>
        <div className="pl-6 space-y-2 pb-3 pt-1 border-l-2 border-muted ml-2">
          {course.units?.map((unit) => (
            <div key={unit.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isUnitSelected(course.id, unit.id)}
                onChange={() => toggleUnit(unit)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Link
                className="text-sm text-primary underline-offset-4 hover:underline"
                to={`/courses/${course.id}/units/${unit.id}`}
              >
                {unit.fileName}
              </Link>
            </div>
          ))}
          {course?.units?.length === 0 && (
            <p className="text-sm text-muted-foreground">No units</p>
          )}
        </div>
      </AccordionContent>

      <DeleteDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        title={`Deleting ${course.name}`}
        description={`Are you sure you want to delete the course ${course.name} with all its units and flashcards?`}
        onDelete={onDelete}
      />
    </AccordionItem>
  );
}
