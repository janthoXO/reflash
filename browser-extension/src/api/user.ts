import axios from "axios"
import type { Course } from "~models/course"

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchUserInfo(
  userId: string,
): Promise<{streak: number, courses: Course[]}> {
  const response = await axios.get(`${API_URL}/api/user?userId=${userId}`)

  if (response.status !== 200) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}