import type { PlasmoMessaging } from "@plasmohq/messaging"

import { fetchUserInfo } from "~api/user"
import { storage } from "~background"
import type { User } from "~models/user"

const handler: PlasmoMessaging.MessageHandler<
  { userId: string },
  User
> = async (req, res) => {
  console.debug("Received user-login", req.body)

  const info = await fetchUserInfo(req.body.userId)
  const user: User = {
    ...info,
    id: req.body.userId
  }

  storage.set("user", user)

  res.send(user)
}

export default handler
