import type { Course, Flashcard, Unit } from "@reflash/shared";
import Dexie, { type EntityTable } from "dexie";

class ReflashDB extends Dexie {
  courses!: EntityTable<Omit<Course, "units">, "id">;
  units!: EntityTable<Omit<Unit, "cards">, "id">;
  flashcards!: EntityTable<Flashcard, "id">;

  constructor() {
    super("ReflashDB");
    // Primary key and indexed props
    this.version(1).stores({
      courses: "++id, &url",
      units: "++id, courseId, fileUrl",
      flashcards: "++id, dueAt, unitId",
    });
  }
}

export async function populateMockData(db: ReflashDB) {
  await db.transaction(
    "rw",
    [db.courses, db.units, db.flashcards],
    async () => {
      // Clear mock data
      const toDeleteCourseIds = await Promise.all([
        db.courses.where({ name: "Introduction to Computer Science" }).delete(),
        db.courses.where({ name: "Advanced Mathematics" }).delete(),
      ]);
      const toDeleteUnitIds = await Promise.all(
        toDeleteCourseIds.map((deleteCourseId) => {
          return db.units.where({ courseId: deleteCourseId }).delete();
        })
      );
      await Promise.all(
        toDeleteUnitIds.map((deleteUnitId) => {
          return db.flashcards.where({ unitId: deleteUnitId }).delete();
        })
      );

      const courseIds = await db.courses.bulkAdd(
        [
          {
            name: "Introduction to Computer Science",
            url: "https://example.com/cs101",
          },
          { name: "Advanced Mathematics", url: "https://example.com/math201" },
        ],
        { allKeys: true }
      );

      const unitIds = await db.units.bulkAdd(
        [
          {
            courseId: courseIds[0]!,
            name: "Lecture 1: Basics.pdf",
            fileName: "Lecture 1: Basics.pdf",
            fileUrl: "https://example.com/cs101/lecture1.pdf",
          },
          {
            courseId: courseIds[0]!,
            name: "Lecture 2: Algorithms.pdf",
            fileName: "Lecture 2: Algorithms.pdf",
            fileUrl: "https://example.com/cs101/lecture2.pdf",
          },
          {
            courseId: courseIds[1]!,
            name: "Calculus Review.pdf",
            fileName: "Calculus Review.pdf",
            fileUrl: "https://example.com/math201/calculus.pdf",
          },
        ],
        { allKeys: true }
      );

      // Create mock flashcards
      const now = Date.now();
      await db.flashcards.bulkAdd([
        {
          unitId: unitIds[0]!,
          question: "What is a variable?",
          answer: "A storage location paired with an associated symbolic name.",
          dueAt: now - 10000, // Due in the past
        },
        {
          unitId: unitIds[0]!,
          question: "What is a loop?",
          answer:
            "A sequence of instructions that is continually repeated until a certain condition is reached.",
          dueAt: now + 86400000, // Due tomorrow
        },
        {
          unitId: unitIds[1]!,
          question: "What is Big O notation?",
          answer:
            "A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.",
          dueAt: now - 5000, // Due in the past
        },
        {
          unitId: unitIds[2]!,
          question: "What is a derivative?",
          answer:
            "The rate of change of a function with respect to a variable.",
          dueAt: now - 1000, // Due in the past
        },
      ]);
    }
  );
}

export const db = new ReflashDB();
