import { useLiveQuery } from "dexie-react-hooks"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~components/ui/accordion"
import { useSelected } from "~contexts/SelectedContext"
import { db } from "~db/db"

export default function LibraryPage() {
  const courses = useLiveQuery(() => db.courses.toArray())
  const units = useLiveQuery(() => db.units.toArray())

  const {
    isCourseSelected,
    isUnitSelected,
    toggleCourse,
    toggleUnit,
    isLoading: isSelectionLoading
  } = useSelected()

  if (!courses || !units || isSelectionLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div>
      <Accordion type="multiple" className="w-full space-y-2">
        {courses.map((course) => {
          const courseUnits = units.filter((u) => u.courseId === course.id)
          return (
            <CourseItem
              key={course.id}
              course={course}
              units={courseUnits}
              isSelected={isCourseSelected(course.id)}
              isUnitSelected={isUnitSelected}
              onToggleCourse={() =>
                toggleCourse(
                  course.id,
                  courseUnits.map((u) => u.id)
                )
              }
              onToggleUnit={toggleUnit}
            />
          )
        })}
      </Accordion>
      {courses.length === 0 && (
        <p className="text-muted-foreground">No courses found.</p>
      )}
    </div>
  )
}

function CourseItem({
  course,
  units,
  isSelected,
  isUnitSelected,
  onToggleCourse,
  onToggleUnit
}: {
  course: any
  units: any[]
  isSelected: boolean
  isUnitSelected: (courseId: number, unitId: number) => boolean
  onToggleCourse: () => void
  onToggleUnit: (courseId: number, unitId: number) => void
}) {
  // TODO: make course name editable
  return (
    <AccordionItem
      value={course.id}
      className="border rounded-lg px-4 bg-card text-card-foreground shadow-sm">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleCourse}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-base font-semibold">{course.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-6 space-y-2 pb-3 pt-1 border-l-2 border-muted ml-2">
          {units.map((unit) => (
            <div key={unit.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isUnitSelected(course.id, unit.id)}
                onChange={() => onToggleUnit(course.id, unit.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">{unit.fileName}</span>
            </div>
          ))}
          {units.length === 0 && (
            <p className="text-sm text-muted-foreground">No units</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
