## File Upload flow

1. flashcards hook:
   listens to event FLASHCARDS_UPDATED which takes the flashcards in the event and updates the state
   publishes event FLASHCARDS_UPDATE
2. PDF scanner:
   listens to FLASHCARDS_UPDATE, scans for pdf links and generates the blob, then publishes them to FILES_SCANNED.
3. pdf service:
   listens to FILES_SCANNED and forwards the files in the message to the api layer just as a normal function call.
   it then takes the result of the api call and publishes it to FLASHCARDS_UPDATED
4. a generic central hook which listens to ERROR, SUCCESS message and has a state of error and success array
5. the ui only reacts/calls the hooks (flashcard hook, central hook)
