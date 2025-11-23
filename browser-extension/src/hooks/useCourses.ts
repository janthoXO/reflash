import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

import type { User } from "~models/user"

export function useCourses() {
  const [user] = useStorage<User>({
    key: "user",
    instance: new Storage({ area: "local" })
  })
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (!user) {
      return
    }

    setCourses(user.courses || [])
  }, [user])

  return {
    courses
  }
}
