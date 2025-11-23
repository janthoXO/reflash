import type { PlasmoMessaging } from "@plasmohq/messaging"

import { answerCard } from "~api/units"
import { storage } from "~background"
import type { Flashcard } from "~models/flashcard"
import type { Unit } from "~models/unit"

const handler: PlasmoMessaging.MessageHandler<
  { fileId: string; cardId: string; correct: boolean },
  Flashcard | null
> = async (req, res) => {
  console.debug("Received cards-answer", req.body)

  const { cardId, correct } = req.body

  const userId = await storage.get("userId")
  const updatedCard = await answerCard(userId, cardId, correct)

  storage.get<Map<string, Unit>>("units").then((unitMap) => {
    // remove card from storage as it will be trained later
    const updatedUnit = unitMap.get(req.body.fileId)

    updatedUnit.cards = updatedUnit.cards.filter((card) => card._id !== cardId)

    unitMap.set(req.body.fileId, updatedUnit)

    storage.set(`units`, unitMap)
  })

  res.send(updatedCard)
}

export default handler
