import axios from "axios"

import type { File } from "~models/file"
import type { Flashcard } from "~models/flashcard"
import type { Unit } from "~models/unit"

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchUnits(
  userId: string,
  courseUrl: string
): Promise<Unit[]> {
  const response = await axios.get(
    `${API_URL}/api/cards/?courseUrl=${courseUrl}&userId=${userId}`
  )

  if (response.status !== 200) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}

export async function unitsAlreadyUploaded(
  userId: string,
  courseUrl: string,
  fileUrls: string[]
): Promise<{ fileUrl: string; exists: boolean }[]> {
  const params = new URLSearchParams()
  fileUrls.forEach((u) => params.append("fileUrls", u))
  params.append("courseUrl", courseUrl)
  params.append("userId", userId)

  const response = await axios.get(
    `${API_URL}/api/courses/1/files?${params.toString()}`
  )
  if (response.status !== 200) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}

/**
 * API layer - handles communication with backend
 * Pure function with no side effects
 */
export async function uploadPDFsAndGenerateFlashcards(
  userId: string,
  courseUrl: string,
  file: File
): Promise<Unit> {
  const payload = {
    filename: file.name,
    mime: "application/pdf",
    data: file.base64,
    fileUrl: file.url,
    courseUrl: courseUrl
  }

  const response = await axios.post(
    `${API_URL}/api/courses/1/files?userId=${userId}`,
    payload
  )

  if (response.status !== 200) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}

export async function answerCard(
  userId: string,
  cardId: string,
  correct: boolean
): Promise<{ streak: number }> {
  const response = await axios.put(
    `${API_URL}/api/flashcard?userId=${userId}`,
    {
      userId,
      cardId,
      solved: correct
    }
  )

  if (response.status !== 200) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}
