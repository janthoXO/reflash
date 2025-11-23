/**
 * Background script
 * Plasmo automatically handles message routing via the messages/ folder
 */
import "@plasmohq/messaging/background"

import { Storage } from "@plasmohq/storage"

import { fetchUserInfo } from "~api/user"

export const storage = new Storage()

storage.get("userId").then((userId) => {
  if (!userId) {
    return
  }

  console.log("Restoring user session for", userId)
  fetchUserInfo(userId)
    .then((info) => {
      console.log("Fetched user info on startup", info)
      const user = {
        id: userId,
        streak: info.streak,
      }
      storage.set("user", user)
      info.courses.forEach((course) => {
        storage.set(`courses-${course._id}`, course)
      })
    })
    .catch((err) => {
      console.error("Failed to fetch user info on startup", err)
    })
})

export {}
