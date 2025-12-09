import type { Course, Flashcard, Unit } from "@reflash/shared"
import Dexie, { type EntityTable } from "dexie"

class ReflashDB extends Dexie {
  courses!: EntityTable<Course, "id">
  units!: EntityTable<Unit, "id">
  flashcards!: EntityTable<Flashcard, "id">

  constructor() {
    super("ReflashDB")
    // Primary key and indexed props
    this.version(1).stores({
      courses: "++id, &url",
      units: "++id, courseId, fileUrl",
      flashcards: "++id, dueAt, unitId"
    })
  }
}

export async function populateMockData(db: ReflashDB) {
  await db.transaction(
    "rw",
    [db.courses, db.units, db.flashcards],
    async () => {
      // Clear existing data
      await db.courses.clear()
      await db.units.clear()
      await db.flashcards.clear()

      const courseIds = await db.courses.bulkAdd(
        [
          {
            name: "Introduction to Computer Science",
            url: "https://example.com/cs101"
          },
          { name: "Advanced Mathematics", url: "https://example.com/math201" }
        ],
        { allKeys: true }
      )

      const unitIds = await db.units.bulkAdd(
        [
          {
            courseId: courseIds[0]!,
            fileName: "Lecture 1: Basics.pdf",
            fileUrl: "https://example.com/cs101/lecture1.pdf",
            cards: []
          },
          {
            courseId: courseIds[0]!,
            fileName: "Lecture 2: Algorithms.pdf",
            fileUrl: "https://example.com/cs101/lecture2.pdf",
            cards: []
          },
          {
            courseId: courseIds[1]!,
            fileName: "Calculus Review.pdf",
            fileUrl: "https://example.com/math201/calculus.pdf",
            cards: []
          }
        ],
        { allKeys: true }
      )

      // Create mock flashcards
      const now = Date.now()
      await db.flashcards.bulkAdd([
        {
          unitId: unitIds[0]!,
          question: "What is a variable?",
          answer: "A storage location paired with an associated symbolic name.",
          dueAt: now - 10000 // Due in the past
        },
        {
          unitId: unitIds[0]!,
          question: "What is a loop?",
          answer:
            "A sequence of instructions that is continually repeated until a certain condition is reached.",
          dueAt: now + 86400000 // Due tomorrow
        },
        {
          unitId: unitIds[1]!,
          question: "What is Big O notation?",
          answer:
            "A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.",
          dueAt: now - 5000 // Due in the past
        },
        {
          unitId: unitIds[2]!,
          question: "What is a derivative?",
          answer:
            "The rate of change of a function with respect to a variable.",
          dueAt: now - 1000 // Due in the past
        }
      ])
    }
  )
}

export const db = new ReflashDB()
