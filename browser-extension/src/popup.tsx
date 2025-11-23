import "./style.css"
import { useUser } from "~hooks/useUser"
import Login from "~login"
import Training from "~training"

function IndexPopup() {
  const { user } = useUser()

  return user ? <Training /> : <Login />
}

export default IndexPopup
