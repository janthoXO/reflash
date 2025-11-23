import axios from "axios"
import type { Course } from "@/models/course"

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchUserInfo(
  userId: string,
): Promise<{streak: number, courses: Course[]}> {
  try {
    const response = await axios.get(`${API_URL}/api/user?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching user info:", error)
    throw error
  }
}