import type { Course, Unit } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, FolderDown, Trash, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~components/ui/dialog";
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

  const {
    isCourseSelected,
    isUnitSelected,
    toggleCourse,
    toggleUnit,
    isLoading: isSelectionLoading,
  } = useSelected();

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
                onClick={() => {
                  toast.warning("Export to Anki not implemented yet.");
                }}
              >
                <FolderDown />
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
            return (
              <CourseItem
                key={course.id}
                course={course}
                isSelected={isCourseSelected(course.id)}
                isUnitSelected={isUnitSelected}
                onToggleCourse={() => toggleCourse(course)}
                onToggleUnit={toggleUnit}
              />
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

function CourseItem({
  course,
  isSelected,
  isUnitSelected,
  onToggleCourse,
  onToggleUnit,
}: {
  course: Course;
  isSelected: boolean;
  isUnitSelected: (courseId: number, unitId: number) => boolean;
  onToggleCourse: () => void;
  onToggleUnit: (unit: Unit) => void;
}) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(course.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  function onSave() {
    course.name = editName;
    db.courses.update(course.id, {name: editName})
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
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleCourse}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />

          {isEdit ? (
            <InputGroup>
              <InputGroupInput
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <InputGroupButton
                variant="ghost"
                type="reset"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
              >
                <X className="text-destructive" />
              </InputGroupButton>
              <InputGroupButton
                type="submit"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <Check className="text-success" />
              </InputGroupButton>
            </InputGroup>
          ) : (
            <div className="font-semibold">{course.name}</div>
          )}

          {!isEdit && (
            <EditDropdown
              onEdit={() => setIsEdit(true)}
              onDelete={() => setShowDeleteDialog(true)}
            />
          )}
        </div>
      </AccordionTrigger>
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
                onChange={() => onToggleUnit(unit)}
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Deleting ${course.name}`}</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete the course ${course.name} with all its units and flashcards?`}
            </DialogDescription>
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
    </AccordionItem>
  );
}
