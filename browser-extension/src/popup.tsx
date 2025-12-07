import "./style.css"

import { useEffect } from "react"
import { MemoryRouter } from "react-router-dom"

import { SelectedProvider } from "~contexts/SelectedContext"
import { db, populateMockData } from "~db/db"
import { Routing } from "~routes"

function IndexPopup() {
  useEffect(() => {
    // Uncomment to populate mock data on startup
    populateMockData(db)
  }, [])

  return (
    <SelectedProvider>
      <MemoryRouter>
        <Routing />
      </MemoryRouter>
    </SelectedProvider>
  )
}

export default IndexPopup
