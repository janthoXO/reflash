import type { PlasmoMessaging } from "@plasmohq/messaging"
import { fetchUserInfo } from "~api/user";

import { storage } from "~background";
import type { Course } from "~models/course";
import type { User } from "~models/user";

const handler: PlasmoMessaging.MessageHandler<
  { },
  {streak: number, courses: Course[]}
> = async (req, res) => {
  console.debug("Received users-info", req.body)

  let user = await storage.get<User>("user")
  const info = await fetchUserInfo(user.id)

  storage.set("user", {
    ...info,
    id: user.id
  })

  res.send(info)
}

export default handler
