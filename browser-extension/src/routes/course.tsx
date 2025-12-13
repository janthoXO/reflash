import type { Course, Unit } from "@reflash/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "~components/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~components/ui/accordion";
import { Button } from "~components/ui/button";
import { db } from "~db/db";

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.debug(courseId);
  }, [courseId]);

  // query already saved course for current URL
  const course = useLiveQuery(async () => {
    if (!courseId) {
      return undefined;
    }
    const courseIdNum = parseInt(courseId);
    const coursePromise = db.courses.get({ id: courseIdNum });
    const unitsPromise = db.units.where({ courseId: courseIdNum }).toArray();

    const course = (await coursePromise) as Course | undefined;
    if (!course) return course;

    course.units = (await unitsPromise) as Unit[];
    course.units.map(async (unit) => {
      unit.cards = await db.flashcards.where({ unitId: unit.id }).toArray();
    });
    console.debug(course);
    return course;
  }, [courseId]);

  if (!course) {
    return null;
  }

  return (
    <div>
      <Header
        title={course?.name ?? "Unknown"}
        prefix={[
          <Button
            variant="ghost"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft />
          </Button>,
        ]}
      />

      <Accordion type="multiple" className="w-full space-y-2">
        {course.units?.map((unit) => (
          <AccordionItem
            value={unit.id.toString()}
            className="border rounded-lg px-4 bg-card text-card-foreground shadow-sm"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Link
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                  to={`/courses/${course.id}/units/${unit.id}`}
                >
                  {unit.fileName}
                </Link>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {unit.cards?.map((card) => <div>{card.question}</div>)}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
