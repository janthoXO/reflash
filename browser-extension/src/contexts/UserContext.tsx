import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { storage } from "~background"
import type { User } from "~models/user"

interface UserContextType {
  user: User | undefined
  loading: boolean
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useStorage<User | undefined>({
    key: "user",
    instance: storage
  })
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

      const user = await sendToBackground({
        name: "users-login",
        body: { userId: userId }
      })

      setUser(user)
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

      // Clear local state after background confirms
      setUser(undefined)
    } catch (error) {
      console.error("Error in logout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
