import type { PlasmoMessaging } from "@plasmohq/messaging"

import { uploadPDFsAndGenerateFlashcards } from "~api/units"
import { storage } from "~background"
import type { File } from "~models/file"
import type { Unit } from "~models/unit"

const handler: PlasmoMessaging.MessageHandler<
  { courseUrl: string; file: File },
  Unit
> = async (req, res) => {
  console.debug("Received units-generate", req.body)

  const { courseUrl, file } = req.body

  // Call API for each file
  const unit = await uploadPDFsAndGenerateFlashcards(courseUrl, file)
    storage.get<Map<string, Unit>>("units").then((unitMap) => {
    // remove card from storage as it will be trained later
    unitMap.set(unit.fileId, unit)
    storage.set(`units`, unitMap)
  })

  res.send(unit)
}

export default handler
