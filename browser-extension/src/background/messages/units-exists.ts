import type { PlasmoMessaging } from "@plasmohq/messaging"

import { unitsAlreadyUploaded } from "~api/units"
import { storage } from "~background"
import type { User } from "~models/user"

const handler: PlasmoMessaging.MessageHandler<
  { courseUrl: string; fileUrls: string[] },
  { fileUrl: string; exists: boolean }[]
> = async (req, res) => {
  console.debug("Received units-exists", req.body)

  const user = await storage.get<User>("user")
  const existsMap = await unitsAlreadyUploaded(
    user.id,
    req.body.courseUrl,
    req.body.fileUrls
  )

  res.send(existsMap)
}

export default handler
