import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import * as SecureStore from "expo-secure-store"
import { fetchUserInfo } from "@/api/user"
import type { User } from "@/models/user"

interface UserContextType {
  user: User | null
  loading: boolean
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  updateStreak: (streak: number) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from storage on mount
  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const storedUser = await SecureStore.getItemAsync("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Refresh user data from API
        const info = await fetchUserInfo(userData.id)
        const updatedUser = { ...userData, ...info }
        setUser(updatedUser)
        await SecureStore.setItemAsync("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }

  async function login(userId: string) {
    setLoading(true)
    try {
      const info = await fetchUserInfo(userId)
      const newUser: User = {
        id: userId,
        ...info
      }
      setUser(newUser)
      await SecureStore.setItemAsync("user", JSON.stringify(newUser))
    } catch (error) {
      console.error("Error in login:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      await SecureStore.deleteItemAsync("user")
      setUser(null)
    } catch (error) {
      console.error("Error in logout:", error)
    } finally {
      setLoading(false)
    }
  }

  function updateStreak(streak: number) {
    if (user) {
      const updatedUser = { ...user, streak }
      setUser(updatedUser)
      SecureStore.setItemAsync("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateStreak }}>
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
