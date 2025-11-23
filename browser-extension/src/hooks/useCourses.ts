import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import type { User } from "~models/user"
import { storage } from "~background"

export function useCourses() {
  const [user] = useStorage<User>({
    key: "user",
    instance: storage
  })
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    console.debug("Updating courses in useCourses", user)
    setCourses(user?.courses || [])
  }, [user])

  return {
    courses
  }
}
