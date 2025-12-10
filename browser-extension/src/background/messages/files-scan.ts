import type { Course, Unit } from "@reflash/shared"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { sendToContentScript } from "@plasmohq/messaging"

import { db } from "~db/db"
import { LLMProvider } from "~models/ai-providers"
import type { File } from "~models/file"
import type { LLMSettings } from "~models/settings"

const OFFSCREEN_DOCUMENT_PATH = "tabs/offscreen.html"

async function hasOffscreenDocument() {
  if ("getContexts" in chrome.runtime) {
    const contexts = await (chrome.runtime as any).getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
    })
    return contexts.length > 0
  }

  return false
}

async function setupOffscreenDocument() {
  if (await hasOffscreenDocument()) return

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: "LLM processing"
  })
}

const handler: PlasmoMessaging.MessageHandler<
  { llmSettings: LLMSettings },
  {}
> = async (req, res) => {
  if (!req.body) {
    req.body = {
      llmSettings: {
        provider: LLMProvider.WASM
      }
    }
  }

  console.debug("Background received files-scan request")

  // request files on site
  console.debug("Requesting files-scan in content script")
  const {
    courseUrl,
    files: filesOnlyUrl
  }: { courseUrl: string; files: File[] } = await sendToContentScript({
    name: "files-scan",
    body: {}
  })

  // check if course already exists, if not, create new course
  let course = await db.courses.get({ url: courseUrl })
  if (!course) {
    console.debug("Creating new course for url ", courseUrl)
    course = { name: "New Course", url: courseUrl } as Course
    course.id = await db.courses.add(course)
  }

  // check which units already exist in this course and compare to files
  const savedUnits = await db.units
    .where("courseId")
    .equals(course.id)
    .toArray()

  const savedFileUrls = new Set(savedUnits.map((u) => u.fileUrl))
  const newFiles = filesOnlyUrl.filter((f) => !savedFileUrls.has(f.url))

  // send new file Urls for download
  console.debug("Requesting download for new files ", newFiles)
  const { files }: { files: File[] } = await sendToContentScript({
    name: "files-download",
    body: { courseUrl: course.url, files: newFiles }
  })

  await setupOffscreenDocument()

  // send files to LLM
  console.debug("Requesting flashcard generation for files ", files)
  // Forward the message to the offscreen document
  // const { units }: { units: Unit[] } = await chrome.runtime.sendMessage({
  //   name: "flashcards-generate",
  //   body: { files }
  // })
  const { units }: { units: Unit[]; message: string } =
    await chrome.runtime.sendMessage({
      name: "flashcards-generate",
      body: { files, llmSettings: req.body.llmSettings }
    })

  console.debug("Received generated units from offscreen document", units)
  // save returned flashcards to DB
  for (const unit of units) {
    unit.courseId = course!.id
    const unitId = await db.units.add(unit)
    for (const card of unit.cards) {
      card.unitId = unitId
    }
    await db.flashcards.bulkAdd(unit.cards)
  }

  res.send({})
}

export default handler
