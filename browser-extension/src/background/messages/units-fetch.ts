import type { PlasmoMessaging } from "@plasmohq/messaging"

import { fetchUnits } from "~api/units"
import { storage } from "~background"
import type { Unit } from "~models/unit"
import type { User } from "~models/user"

const handler: PlasmoMessaging.MessageHandler<
  { courseUrl: string },
  Unit[]
> = async (req, res) => {
  console.debug("Received cards-fetch", req.body)

  const { courseUrl } = req.body

  const user = await storage.get<User>("user")
  const units = await fetchUnits(user.id, courseUrl)

  res.send(units)
}

export default handler
