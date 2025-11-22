import { useState, useEffect } from "react"

export interface Notification {
  id: string
  type: "error" | "success"
  message: string
  timestamp: number
}

/**
 * Central notification hook
 * Listens to: ERROR, SUCCESS
 * Manages notification state for the UI
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === "ERROR" || message.type === "SUCCESS") {
        console.debug("Received notification", message)
        const notification: Notification = {
          id: `${message.type}-${Date.now()}`,
          type: message.type.toLowerCase() as "error" | "success",
          message: message.message,
          timestamp: Date.now()
        }

        setNotifications((prev) => [...prev, notification])

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          )
        }, 5000)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    dismissNotification,
    clearAll
  }
}
