import type { Course } from "@reflash/shared";

export function sanitizeStringForFilename(text: string): string {
  return text.replaceAll(/[^a-z0-9]/gi, "_");
}

function sanitizeForAnki(text: string): string {
  return text.replaceAll('"', '""');
}

// exports the course with its units and flashcards as Anki format (each course is a deck and each unit a tag)
export function exportAsAnki(courses: Course[]): string {
  let content =
    "#separator:Semicolon\n#deck column:3\n#tags column:4\n#columns:Front;Back;Deck;Tags";
  for (const course of courses) {
    if (!course.units) continue;
    for (const unit of course.units) {
      if (!unit.cards) continue;

      for (const card of unit.cards) {
        content += `\n"${sanitizeForAnki(card.question)}";"${sanitizeForAnki(card.answer)}";"${sanitizeForAnki(course.name)}";"${sanitizeForAnki(unit.name)}"`;
      }
    }
  }
  return content;
}

// exports the units as Anki Legacy format and returns the content per unit
export function exportAsAnkiLegacy(courses: Course[]): string[] {
  const decks: string[] = [];
  for (const course of courses) {
    if (!course.units) continue;

    let content = "";
    for (const unit of course.units) {
      if (!unit.cards) continue;
      for (const card of unit.cards) {
        content += `\n"${sanitizeForAnki(card.question)}";"${sanitizeForAnki(card.answer)}"`;
      }
    }
    decks.push(content);
  }

  return decks;
}
