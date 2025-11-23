import axios from "axios"

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

export async function fetchUserInfo(
  userId: string,
): Promise<{streak: number, courses: Course[]}> {
  const response = await axios.get(`${API_URL}/api/user-info?userId=${userId}`)

  if (response.status !== 200) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.data
}