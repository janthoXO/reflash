import type { PlasmoMessaging } from "@plasmohq/messaging"

import { fetchUnits } from "~api/units"
import { storage } from "~background"
import type { Unit } from "~models/unit"

const handler: PlasmoMessaging.MessageHandler<
  { userId: string; courseUrl: string },
  Unit[]
> = async (req, res) => {
  console.debug("Received cards-fetch", req.body)

  const { userId, courseUrl } = req.body

  const units = await fetchUnits(userId, courseUrl)
  const unitsMap = new Map<string, Unit>()
  units.forEach((unit) => {
    unitsMap.set(unit.fileId, unit)
  })
  storage.set("units", unitsMap)

  res.send(units)
}

export default handler
