import type { PlasmoMessaging } from "@plasmohq/messaging"
import { uploadPDFsAndGenerateFlashcards } from "~api/units"
import type { File } from "~models/file"
import type { Unit } from "~models/unit"

const handler: PlasmoMessaging.MessageHandler<{courseUrl: string, files: File[]}, Unit[]> = async (req, res) => {
  console.debug("Received units-generate", req.body)

  const {courseUrl, files} = req.body;

  const units: Unit[] = []
  // Call API for each file
  for (const file of files) {
    const unit = await uploadPDFsAndGenerateFlashcards(courseUrl, file)
    console.debug(
      `Generated ${unit.cards.length} flashcard${
        unit.cards.length !== 1 ? "s" : ""
      } from 1 file`
    )
    units.push(unit)
  }

  res.send(units)
}

export default handler