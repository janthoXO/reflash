import type { Course, Unit } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, MessageSquareCode, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import AnkiExportButton from "~components/ankiExportButton";
import SyncButton from "~components/syncButton";


export default function LibraryPage() {
  const courses = useLiveQuery(() => db.courses.toArray()) as
    | Course[]
    | undefined;

  const units = useLiveQuery(() => db.units.toArray()) as Unit[] | undefined;

  const populatedCourse = useMemo(() => {
    if (!courses || !units) return;

    const courseToUnits = new Map<number, Unit[]>();
    for (const unit of units) {
      if (!unit.courseId) continue;
      if (!courseToUnits.has(unit.courseId)) {
        courseToUnits.set(unit.courseId, []);
      }
      courseToUnits.get(unit.courseId)?.push(unit);
    }

    return courses.map((course) => {
      return {
        ...course,
        units: courseToUnits.get(course.id) || [],
      };
    });
  }, [courses, units]);

  const { isLoading: isSelectionLoading } = useSelected();

  if (!populatedCourse) {
    return <div className="p-4">No courses yet.</div>;
  }

  if (isSelectionLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Library"
        suffix={[
          <Tooltip key="export-anki-tooltip">
            <TooltipTrigger asChild>
              <AnkiExportButton />
            </TooltipTrigger>
            <TooltipContent>Export Flashcards to Anki Format</TooltipContent>
          </Tooltip>,
          <SyncButton key="library-sync-button" />,
          <TrackingButton key="library-tracking-button" />,
        ]}
      />
      {populatedCourse.length === 0 ? (
        <p className="text-muted-foreground">No courses found.</p>
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {populatedCourse.map((course) => {
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
    db.courses.update(course.id, { name: editName, updatedAt: Date.now() });
    setIsEdit(false);
  }

  function onReset() {
    setIsEdit(false);
    setEditName(course.name);
  }

  function onDelete() {
    const now = Date.now();
    db.courses.update(course.id, { deletedAt: now, updatedAt: now });
    db.units
      .where({ courseId: course.id })
      .modify({ deletedAt: now, updatedAt: now });
    db.flashcards
      .where("unitId")
      .anyOf(course.units?.map((u) => u.id) ?? [])
      .modify({ deletedAt: now, updatedAt: now });
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
                <MessageSquareCode />
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
