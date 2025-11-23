import "./style.css"
import { MemoryRouter } from "react-router-dom"
import { UserProvider } from "~contexts/UserContext"
import { Routing } from "~routes"

function IndexPopup() {
  return (
    <UserProvider>
      <MemoryRouter>
        <Routing />
      </MemoryRouter>
    </UserProvider>
  )
}

export default IndexPopup
