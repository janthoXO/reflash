import type { PlasmoMessaging } from "@plasmohq/messaging"
import { fetchUserInfo } from "~api/user";

import { storage } from "~background";
import type { User } from "~models/user";

const handler: PlasmoMessaging.MessageHandler<
  { },
  {streak: number, courses: Course[]}
> = async (req, res) => {
  console.debug("Received users-info", req.body)

  let user = await storage.get<User>("user")
  const info = await fetchUserInfo(user.id)

  user = {id: user.id, streak: info.streak}
  storage.set("user", user)

  info.courses.forEach((course) => {
    storage.set(`courses-${course._id}`, course)
  })

  res.send(info)
}

export default handler
