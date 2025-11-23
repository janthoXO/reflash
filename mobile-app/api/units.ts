import axios from "axios"
import type { Unit } from "@/models/unit"

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchUnits(
  userId: string,
  courseUrl: string
): Promise<Unit[]> {
  try {
    const response = await axios.get(
      `${API_URL}/api/cards/?courseUrl=${encodeURIComponent(courseUrl)}&userId=${userId}`
    )
    return response.data
  } catch (error) {
    console.error("Error fetching units:", error)
    throw error
  }
}

export async function answerCard(
  userId: string,
  cardId: string,
  correct: boolean
): Promise<{ streak: number }> {
  try {
    const response = await axios.put(
      `${API_URL}/api/flashcard?userId=${userId}`,
      {
        userId,
        cardId,
        solved: correct
      }
    )
    return response.data
  } catch (error) {
    console.error("Error answering card:", error)
    throw error
  }
}
