/**
 * Background script
 * Plasmo automatically handles message routing via the messages/ folder
 */
import "@plasmohq/messaging/background"

import { Storage } from "@plasmohq/storage"

import { fetchUserInfo } from "~api/user"
import type { User } from "~models/user"

export const storage = new Storage({ area: "local" })

storage.get<User>("user").then((user) => {
  if (!user) {
    return
  }

  console.log("Restoring user session for", user.id)
  fetchUserInfo(user.id)
    .then((info) => {
      console.log("Fetched user info on startup", info)
      user = {
        ...info,
        id: user.id,
      }
      storage.set("user", user)
    })
    .catch((err) => {
      console.error("Failed to fetch user info on startup", err)
    })
})

export {}
