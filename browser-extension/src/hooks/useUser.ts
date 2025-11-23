import { useState } from "react"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import type { File } from "~models/file"
import type { Unit } from "~models/unit"
import type { User } from "~models/user"

/**
 * Hook for units state management
 * Listens to: UNITS_UPDATED
 * Publishes: UNITS_UPDATE
 */
export function useUser() {
  const [user] = useStorage<User>("user", undefined)
  const [loading, setLoading] = useState(false)

  async function fetchUser() {
    setLoading(true)
    try {
      console.debug("Send users-info")

      await sendToBackground({
        name: "users-info",
        body: {}
      })
    } catch (error) {
      console.error("Error in fetchUser:", error)
    } finally {
      setLoading(false)
    }
  }

  async function login(userId: string) {
    setLoading(true)
    try {
      console.debug("Send users-login")

      await sendToBackground({
        name: "users-login",
        body: { userId: userId }
      })
    } catch (error) {
      console.error("Error in login:", error)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      console.debug("Send users-logout")

      await sendToBackground({
        name: "users-logout",
        body: {}
      })
    } catch (error) {
      console.error("Error in logout:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    fetchUser
  }
}
