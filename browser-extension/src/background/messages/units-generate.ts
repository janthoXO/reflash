import type { PlasmoMessaging } from "@plasmohq/messaging"

import { uploadPDFsAndGenerateFlashcards } from "~api/units"
import { storage } from "~background"
import type { File } from "~models/file"
import type { Unit } from "~models/unit"
import type { User } from "~models/user"

const handler: PlasmoMessaging.MessageHandler<
  { courseUrl: string; file: File },
  Unit
> = async (req, res) => {
  console.debug("Received units-generate", req.body)

  const { courseUrl, file } = req.body

  // Call API for each file
  const user = await storage.get<User>("user")
  const unit = await uploadPDFsAndGenerateFlashcards(user.id, courseUrl, file)
  storage.get<Record<string, Unit>[]>("units").then((unitMap) => {
    if (!unitMap) {
      unitMap = []
    }
    // remove card from storage as it will be trained later
    unitMap[unit.fileId] = unit
    storage.set(`units`, unitMap)
    console.debug("Updated units in storage after generating unit", unitMap)
  })

  res.send(unit)
}

export default handler
