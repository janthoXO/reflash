# Event-Driven Architecture

## Event Flow

```
User clicks "Upload PDFs"
         ↓
[popup.tsx] calls triggerUpdate()
         ↓
[useFlashcards] publishes: FLASHCARDS_UPDATE
         ↓
[background/index.ts] forwards message to content script
         ↓
[pdf-scanner.ts] listens to: FLASHCARDS_UPDATE
         ↓
[pdf-scanner.ts] scans page & downloads PDFs
         ↓
[pdf-scanner.ts] publishes: FILES_SCANNED
         ↓
[pdf-service.ts] listens to: FILES_SCANNED
         ↓
[pdf-service.ts] calls API layer
         ↓
[flashcards.ts] uploads to backend
         ↓
[pdf-service.ts] publishes: FLASHCARDS_UPDATED
         ↓
[useFlashcards] listens to: FLASHCARDS_UPDATED
         ↓
[popup.tsx] displays flashcards
```

## Events

### FLASHCARDS_UPDATE
- **Published by**: `useFlashcards` hook
- **Listened by**: `pdf-scanner.ts` (content script)
- **Payload**: None
- **Purpose**: Trigger the PDF scanning process

### FILES_SCANNED
- **Published by**: `pdf-scanner.ts` (content script)
- **Listened by**: `pdf-service.ts` (service)
- **Payload**: `{ files: File[] }`
- **Purpose**: Pass scanned PDF files to service layer

### FLASHCARDS_UPDATED
- **Published by**: `pdf-service.ts` (service)
- **Listened by**: `useFlashcards` hook
- **Payload**: `{ flashcards: Flashcard[] }`
- **Purpose**: Update UI with generated flashcards

### ERROR
- **Published by**: `pdf-scanner.ts`, `pdf-service.ts`
- **Listened by**: `useNotifications` hook
- **Payload**: `{ message: string }`
- **Purpose**: Display error notifications

### SUCCESS
- **Published by**: `pdf-service.ts`
- **Listened by**: `useNotifications` hook
- **Payload**: `{ message: string }`
- **Purpose**: Display success notifications

## Component Responsibilities

### 1. **popup.tsx** (UI Layer)
- Renders UI
- Calls hooks
- No business logic

### 2. **useFlashcards** (State Hook)
- Manages flashcard state
- Listens: `FLASHCARDS_UPDATED`
- Publishes: `FLASHCARDS_UPDATE`

### 3. **useNotifications** (State Hook)
- Manages notification state
- Listens: `ERROR`, `SUCCESS`
- Auto-dismisses after 5 seconds

### 4. **pdf-scanner.ts** (Content Script)
- Runs on web pages
- Scans for PDF links
- Downloads PDFs (respects authentication)
- Listens: `FLASHCARDS_UPDATE`
- Publishes: `FILES_SCANNED`, `ERROR`

### 5. **pdf-service.ts** (Service Layer)
- Orchestrates API calls
- Listens: `FILES_SCANNED`
- Publishes: `FLASHCARDS_UPDATED`, `ERROR`, `SUCCESS`

### 6. **flashcards.ts** (API Layer)
- Pure function
- Handles HTTP requests
- No Chrome API usage

### 7. **background/index.ts** (Message Router)
- Routes messages between components
- Imports service to register listeners
- Forwards `FLASHCARDS_UPDATE` to active tab

## Benefits

✅ **Loose coupling** - Components don't know about each other
✅ **Single responsibility** - Each component does one thing
✅ **Easy to extend** - Add new listeners without modifying existing code
✅ **Easy to test** - Mock events instead of mocking components
✅ **Easy to debug** - Trace event flow through console logs
✅ **Reusable** - Same events can trigger from multiple sources (keyboard, context menu, etc.)
