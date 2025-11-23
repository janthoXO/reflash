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

  res.send(unit)
}

export default handler
