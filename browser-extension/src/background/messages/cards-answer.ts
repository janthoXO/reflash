import type { PlasmoMessaging } from "@plasmohq/messaging"

import { answerCard } from "~api/units"
import { storage } from "~background"
import type { User } from "~models/user"

const handler: PlasmoMessaging.MessageHandler<
  { cardId: string; correct: boolean },
  { streak: number }
> = async (req, res) => {
  console.debug("Received cards-answer", req.body)

  const { cardId, correct } = req.body

  const user = await storage.get<User>("user")
  const { streak } = await answerCard(user.id, cardId, correct)
  if (correct) {
    storage.get<User>("user").then((user) => {
      if (user) {
        user.streak = streak
        storage.set("user", user)
      }
    })
  }

  res.send({ streak })
}

export default handler
