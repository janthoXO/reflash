# Reflash

Reflash is easily accessible studying, without extra steps. Start learning directly from flashcards in your browser, simply by opening your Moodle course site.


## Inspiration
Every student knows the feeling: you want to start studying early, but the hurdle of creating flashcards or organizing notes is just too high. Tools like Anki are powerful, but the manual setup is tedious, and in the end, procrastination wins. We wanted to make studying as frictionless as possible, so easy that you can start from day one with no excuses. That’s why we built Reflash: to automate the boring parts and make learning both accessible and rewarding.

## What it does
Reflash is a browser extension and backend service that automatically grabs files from your Moodle course site, sends them to our server, and generates flashcards for you. The flashcards are instantly available in the extension, so you can start studying right away without any manual card creation required. This enables students to skip the "I would start now, but I didn't have time yet to go through my files and create some study notes..." Just spontaneously start the next time you're checking a Moodle Announcement, even if it's just for five minutes!
To keep motivation high, Reflash tracks your learning streak and rewards you with virtual flowers for every day you study, even if it’s just a little bit. 

## How it works
We developed a browser extension that integrates with Moodle, detecting and collecting course files with a single click. These files are sent to our Node.js/Express backend, which processes the content and generates flashcards using custom logic. The backend exposes RESTful endpoints for file uploads, flashcard retrieval, and user stats. The extension fetches due flashcards and displays them in a simple, user-friendly interface, tracking your progress and streak.

## What's next for Reflash
- Expanding the extension to an additional app for students to use for studying. The databases can already be accessed and synchronized through an app, but we were missing time and additional resources to build one.
- Adding social features that allow students to share their progress and challenge friends, further motivating them.
- More customization options for flashcards for a more suited experience for every user.
