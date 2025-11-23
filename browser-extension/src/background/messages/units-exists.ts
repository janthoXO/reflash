import type { PlasmoMessaging } from "@plasmohq/messaging"
import { unitsAlreadyUploaded } from "~api/units";

const handler: PlasmoMessaging.MessageHandler<
  { fileUrls: string[] },
  { fileUrl: string; exists: boolean }[]
> = async (req, res) => {
  console.debug("Received units-exists", req.body)

  const existsMap = await unitsAlreadyUploaded(req.body.fileUrls)

  res.send(existsMap)
}

export default handler
