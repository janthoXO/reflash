-- Seed Courses
INSERT INTO courses (name, url) VALUES ('Introduction to Computer Science', 'https://example.com/cs101') ON CONFLICT(url) DO NOTHING;--> statement-breakpoint
INSERT INTO courses (name, url) VALUES ('Advanced Mathematics', 'https://example.com/math201') ON CONFLICT(url) DO NOTHING;--> statement-breakpoint
-- Seed Units
INSERT INTO units (courseId, name, fileName, fileUrl)
SELECT id, 'Lecture 1: Basics.pdf', 'Lecture 1: Basics.pdf', 'https://example.com/cs101/lecture1.pdf'
FROM courses WHERE url = 'https://example.com/cs101'
AND NOT EXISTS (SELECT 1 FROM units WHERE fileUrl = 'https://example.com/cs101/lecture1.pdf');
--> statement-breakpoint
INSERT INTO units (courseId, name, fileName, fileUrl)
SELECT id, 'Lecture 2: Algorithms.pdf', 'Lecture 2: Algorithms.pdf', 'https://example.com/cs101/lecture2.pdf'
FROM courses WHERE url = 'https://example.com/cs101'
AND NOT EXISTS (SELECT 1 FROM units WHERE fileUrl = 'https://example.com/cs101/lecture2.pdf');
--> statement-breakpoint
INSERT INTO units (courseId, name, fileName, fileUrl)
SELECT id, 'Calculus Review.pdf', 'Calculus Review.pdf', 'https://example.com/math201/calculus.pdf'
FROM courses WHERE url = 'https://example.com/math201'
AND NOT EXISTS (SELECT 1 FROM units WHERE fileUrl = 'https://example.com/math201/calculus.pdf');
--> statement-breakpoint
-- Seed Flashcards
INSERT INTO flashcards (unitId, question, answer, dueAt)
SELECT id, 'What is a variable?', 'A storage location paired with an associated symbolic name.', (strftime('%s', 'now') * 1000 - 10000)
FROM units WHERE fileUrl = 'https://example.com/cs101/lecture1.pdf'
AND NOT EXISTS (SELECT 1 FROM flashcards WHERE question = 'What is a variable?' AND unitId = units.id);
--> statement-breakpoint
INSERT INTO flashcards (unitId, question, answer, dueAt)
SELECT id, 'What is a loop?', 'A sequence of instructions that is continually repeated until a certain condition is reached.', (strftime('%s', 'now') * 1000 + 86400000)
FROM units WHERE fileUrl = 'https://example.com/cs101/lecture1.pdf'
AND NOT EXISTS (SELECT 1 FROM flashcards WHERE question = 'What is a loop?' AND unitId = units.id);
--> statement-breakpoint
INSERT INTO flashcards (unitId, question, answer, dueAt)
SELECT id, 'What is Big O notation?', 'A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.', (strftime('%s', 'now') * 1000 - 5000)
FROM units WHERE fileUrl = 'https://example.com/cs101/lecture2.pdf'
AND NOT EXISTS (SELECT 1 FROM flashcards WHERE question = 'What is Big O notation?' AND unitId = units.id);
--> statement-breakpoint
INSERT INTO flashcards (unitId, question, answer, dueAt)
SELECT id, 'What is a derivative?', 'The rate of change of a function with respect to a variable.', (strftime('%s', 'now') * 1000 - 1000)
FROM units WHERE fileUrl = 'https://example.com/math201/calculus.pdf'
AND NOT EXISTS (SELECT 1 FROM flashcards WHERE question = 'What is a derivative?' AND unitId = units.id);
