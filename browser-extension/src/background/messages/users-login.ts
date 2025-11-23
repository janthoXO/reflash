import type { PlasmoMessaging } from "@plasmohq/messaging"

import { fetchUserInfo } from "~api/user"
import { storage } from "~background"
import type { User } from "~models/user"

const handler: PlasmoMessaging.MessageHandler<{ userId: string }, {}> = async (
  req,
  res
) => {
  console.debug("Received user-login", req.body)

  const info = await fetchUserInfo(req.body.userId)
    const user: User = {
    id: req.body.userId,
    streak: info.streak,
  }

  storage.set("user", user)
  info.courses.forEach((course) => {
    storage.set(`courses-${course._id}`, course)
    console.debug("Updated courses in storage after user login", course)
  })

  res.send(info)
}

export default handler
