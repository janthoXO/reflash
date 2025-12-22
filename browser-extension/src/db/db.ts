import type { Course, Flashcard, Unit } from "@reflash/shared";
import Dexie, { type EntityTable, type InsertType } from "dexie";

class ReflashDB extends Dexie {
  courses!: EntityTable<Course, "id", InsertType<Omit<Course, "units">, "id">>;
  units!: EntityTable<Unit, "id", InsertType<Omit<Unit, "cards">, "id">>;
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
      const now = Date.now();

      const courses = await Promise.all([
        mockCourse({
          name: "Introduction to Computer Science",
          url: "https://example.com/cs101",
          updatedAt: now,
          deletedAt: null,
        } as Course),
        mockCourse({
          name: "Advanced Mathematics",
          url: "https://example.com/math201",
          updatedAt: now,
          deletedAt: null,
        } as Course),
      ]);

      const units = await Promise.all([
        mockUnit({
          courseId: courses[0].id,
          name: "Lecture 1: Basics.pdf",
          fileName: "Lecture 1: Basics.pdf",
          fileUrl: "https://example.com/cs101/lecture1.pdf",
          updatedAt: now,
          deletedAt: null,
        } as Unit),
        mockUnit({
          courseId: courses[0].id,
          name: "Lecture 2: Algorithms.pdf",
          fileName: "Lecture 2: Algorithms.pdf",
          fileUrl: "https://example.com/cs101/lecture2.pdf",
          updatedAt: now,
          deletedAt: null,
        } as Unit),
        mockUnit({
          courseId: courses[1].id,
          name: "Calculus Review.pdf",
          fileName: "Calculus Review.pdf",
          fileUrl: "https://example.com/math201/calculus.pdf",
          updatedAt: now,
          deletedAt: null,
        } as Unit),
      ]);

      await Promise.all([
        mockFlashcard({
          unitId: units[0]!.id,
          question: "What is a variable?",
          answer: "A storage location paired with an associated symbolic name.",
          dueAt: now - 10000,
          updatedAt: now,
          deletedAt: null,
        } as Flashcard),
        mockFlashcard({
          unitId: units[0]!.id,
          question: "What is a loop?",
          answer:
            "A sequence of instructions that is continually repeated until a certain condition is reached.",
          dueAt: now + 86400000,
          updatedAt: now,
          deletedAt: null,
        } as Flashcard),
        mockFlashcard({
          unitId: units[1]!.id,
          question: "What is Big O notation?",
          answer:
            "A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.",
          dueAt: now - 5000,
          updatedAt: now,
          deletedAt: null,
        } as Flashcard),
        mockFlashcard({
          unitId: units[2]!.id,
          question: "What is a derivative?",
          answer:
            "The rate of change of a function with respect to a variable.",
          dueAt: now - 1000,
          updatedAt: now,
          deletedAt: null,
        } as Flashcard),
      ]);
    }
  );
}

async function mockCourse(course: Course): Promise<Course> {
  const foundCourse = await db.courses.get({ url: course.url });
  if (foundCourse) {
    // Course already exists, reset fields
    course.id = foundCourse.id;
    await db.courses.update(course.id, course);
  } else {
    // Create new course
    course.id = await db.courses.add(course);
  }

  return course;
}

async function mockUnit(unit: Unit): Promise<Unit> {
  const foundUnit = await db.units.get({
    courseId: unit.courseId,
    fileUrl: unit.fileUrl,
  });
  if (foundUnit) {
    // Unit already exists, reset fields
    unit.id = foundUnit.id;
    await db.units.update(unit.id, unit);
  } else {
    // Create new unit
    unit.id = await db.units.add(unit);
  }

  return unit;
}

async function mockFlashcard(flashcard: Flashcard): Promise<Flashcard> {
  const foundFlashcard = await db.flashcards.get({
    unitId: flashcard.unitId,
    question: flashcard.question,
  });
  if (foundFlashcard) {
    // Flashcard already exists, reset fields
    flashcard.id = foundFlashcard.id;
    await db.flashcards.update(flashcard.id, flashcard);
  } else {
    // Create new flashcard
    flashcard.id = await db.flashcards.add(flashcard);
  }

  return flashcard;
}

export const db = new ReflashDB();
