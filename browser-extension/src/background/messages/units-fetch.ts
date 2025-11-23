import type { PlasmoMessaging } from "@plasmohq/messaging"

import { fetchUnits } from "~api/units"
import type { Unit } from "~models/unit"

const handler: PlasmoMessaging.MessageHandler<
  { userId: string; courseUrl: string },
  Unit[]
> = async (req, res) => {
  console.debug("Received cards-fetch", req.body)

  const { userId, courseUrl } = req.body

  const units = await fetchUnits(userId, courseUrl)

  res.send(units)
}

export default handler
