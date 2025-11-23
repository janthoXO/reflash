import type { PlasmoMessaging } from "@plasmohq/messaging"

import { storage } from "~background"

const handler: PlasmoMessaging.MessageHandler<{}, {}> = async (
  req,
  res
) => {
  console.debug("Received user-logout", req.body)

  storage.set("user", undefined)

  res.send({})
}

export default handler
