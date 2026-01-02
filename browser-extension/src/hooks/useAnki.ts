import type { Course, Unit } from "@reflash/shared";
import JSZip from "jszip";
import { useSelected } from "~contexts/SelectedContext";
import { db } from "~db/db";
import {
  exportAsAnki,
  exportAsAnkiLegacy,
  sanitizeStringForFilename,
} from "~lib/anki";

export function useAnki() {
  const { selectedMap } = useSelected();

  async function exportAnki(legacy?: boolean) {
    const populatedCourses = await Promise.all(
      Object.entries(selectedMap).map(async ([courseIdStr, unitIds]) => {
        const courseId = parseInt(courseIdStr);
        const allCourses = await db.courses.toArray();
        console.debug("All courses in DB:", allCourses);
        const course = (await db.courses.get({ id: courseId })) as Course;
        if (!course) {
          console.warn(`Course ${courseId} not found for Anki export`);
          throw new Error("Course not found");
        }

        course.units = (await db.units
          .where("courseId")
          .equals(courseId)
          .filter((unit) => unitIds.includes(unit.id!))
          .toArray()) as Unit[];

        course.units = await Promise.all(
          course.units.map(async (unit) => {
            const cards = await db.flashcards
              .where("unitId")
              .equals(unit.id!)
              .toArray();
            unit.cards = cards;
            return unit;
          })
        );

        return course;
      })
    );

    let blob: Blob;
    let filename: string;
    if (legacy) {
      const filesContent = exportAsAnkiLegacy(populatedCourses);
      const zip = new JSZip();
      filesContent.forEach((content, index) => {
        const course = populatedCourses[index];
        const filename = `${sanitizeStringForFilename(course?.name ?? "course_" + index)}.txt`;
        zip.file(filename, content);
      });
      blob = await zip.generateAsync({ type: "blob" });
      filename = "reflash_anki_legacy_export.zip";
    } else {
      const fileContent = exportAsAnki(populatedCourses);
      blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      filename = "reflash_anki_export.txt";
    }

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return { exportAnki };
}
