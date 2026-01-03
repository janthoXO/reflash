import { useMessage } from "@plasmohq/messaging/hook";
import { LLMProvider, LLMSettingsSchema } from "~models/settings";
import { sendToBackground } from "@plasmohq/messaging";
import { generateFlashcardsProvider } from "../lib/llm/provider-llm-processor";
import { generateFlashcardsWasm } from "../lib/llm/wasm-llm-processor";
import z from "zod";
import { AlertLevel } from "~models/alert";

const RequestSchema = z.object({
  courseId: z.number(),
  unitId: z.number(),
  llmSettings: LLMSettingsSchema,
  customPrompt: z.string(),
  fileBase64: z.string(),
});

type RequestType = z.infer<typeof RequestSchema>;

export default function Offscreen() {
  useMessage<
    RequestType,
    // just acknowledge message but return data in async response
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {}
  >(async (req, res) => {
    if (req.name !== "flashcards-generate") return;

    console.debug(
      "[Offscreen: flashcards-generate] Received flashcards-generate request\n",
      req.body
    );
    const reqBodyParsed = RequestSchema.safeParse(req.body);
    if (!reqBodyParsed.success) {
      console.error("[Offscreen: flashcards-generate] Invalid body in request");
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: AlertLevel.Error,
            message: "Failed to generate flashcards",
          },
        },
      });
      res.send({ unit: {} });
      return;
    }
    const reqBody: RequestType = reqBodyParsed.data;

    try {
      if (reqBody.llmSettings.provider === LLMProvider.WASM) {
        generateFlashcardsWasm(
          reqBody.courseId,
          reqBody.unitId,
          reqBody.fileBase64,
          reqBody.llmSettings.model,
          reqBody.customPrompt
        );
      } else {
        generateFlashcardsProvider(
          reqBody.courseId,
          reqBody.unitId,
          reqBody.fileBase64,
          reqBody.llmSettings,
          reqBody.customPrompt
        );
      }
    } catch (e) {
      console.error("[Offscreen: flashcards-generate] Error:", e);
      sendToBackground({
        name: "alert",
        body: {
          alert: {
            level: AlertLevel.Error,
            message: "Failed to generate flashcards",
          },
        },
      });
    } finally {
      res.send({});
    }
  });

  return <div>LLM Brain</div>;
}
