import axios from "axios"
import type { File } from "~models/file"
import type { Unit } from "~models/unit"

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

/**
 * API layer - handles communication with backend
 * Pure function with no side effects
 */
export async function uploadPDFsAndGenerateFlashcards(
  courseUrl: string,
  file: File
): Promise<Unit> {  
  const payload = {
    filename: file.name,
    mime: "application/pdf",
    data: file.base64,
    fileUrl: file.url ?? null,
    courseUrl: courseUrl
  }

const response = await axios.post(`${API_URL}/api/files`, payload)

  if (response.status !== 200) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}