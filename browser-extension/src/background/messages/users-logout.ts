import type { PlasmoMessaging } from "@plasmohq/messaging"

import { storage } from "~background"

const handler: PlasmoMessaging.MessageHandler<{}, {}> = async (
  req,
  res
) => {
  console.debug("Received user-logout", req.body)

  await storage.remove("user")

  res.send({})
}

export default handler
