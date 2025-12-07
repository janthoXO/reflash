import type { Course, Flashcard, Unit } from "@reflash/shared"
import Dexie, { type Table } from "dexie"

class ReflashDB extends Dexie {
  courses!: Table<Course>
  units!: Table<Unit>
  flashcards!: Table<Flashcard>

  constructor() {
    super("ReflashDB")
    // Primary key and indexed props
    this.version(1).stores({
      courses: "id, name",
      units: "id, courseId",
      flashcards: "id, unitId, dueAt"
    })
  }
}

export async function populateMockData(db: ReflashDB) {
  await db.transaction("rw", db.courses, db.units, db.flashcards, async () => {
    // Clear existing data
    await db.courses.clear()
    await db.units.clear()
    await db.flashcards.clear()

    // Create mock courses
    const course1Id = "course-1"
    const course2Id = "course-2"

    await db.courses.bulkAdd([
      { id: course1Id, name: "Introduction to Computer Science", url: "https://example.com/cs101" },
      { id: course2Id, name: "Advanced Mathematics", url: "https://example.com/math201" }
    ])

    // Create mock units
    const unit1Id = "unit-1"
    const unit2Id = "unit-2"
    const unit3Id = "unit-3"

    await db.units.bulkAdd([
      {
        id: unit1Id,
        courseId: course1Id,
        fileName: "Lecture 1: Basics.pdf",
        fileUrl: "https://example.com/cs101/lecture1.pdf",
        cards: []
      },
      {
        id: unit2Id,
        courseId: course1Id,
        fileName: "Lecture 2: Algorithms.pdf",
        fileUrl: "https://example.com/cs101/lecture2.pdf",
        cards: []
      },
      {
        id: unit3Id,
        courseId: course2Id,
        fileName: "Calculus Review.pdf",
        fileUrl: "https://example.com/math201/calculus.pdf",
        cards: []
      }
    ])

    // Create mock flashcards
    const now = Date.now()
    await db.flashcards.bulkAdd([
      {
        id: "fc-1",
        unitId: unit1Id,
        question: "What is a variable?",
        answer: "A storage location paired with an associated symbolic name.",
        dueAt: now - 10000 // Due in the past
      },
      {
        id: "fc-2",
        unitId: unit1Id,
        question: "What is a loop?",
        answer: "A sequence of instructions that is continually repeated until a certain condition is reached.",
        dueAt: now + 86400000 // Due tomorrow
      },
      {
        id: "fc-3",
        unitId: unit2Id,
        question: "What is Big O notation?",
        answer: "A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.",
        dueAt: now - 5000 // Due in the past
      },
      {
        id: "fc-4",
        unitId: unit3Id,
        question: "What is a derivative?",
        answer: "The rate of change of a function with respect to a variable.",
        dueAt: now - 1000 // Due in the past
      }
    ])
  })
}

export const db = new ReflashDB()
