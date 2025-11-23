import { Route, Routes } from "react-router-dom"
import { useUser } from "~contexts/UserContext"
import Login from "./login"
import Training from "./training"

export const Routing = () => {
  const { user } = useUser()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={user ? <Training /> : <Login />} />
    </Routes>
  )
}