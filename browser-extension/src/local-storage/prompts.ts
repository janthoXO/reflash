import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

const defaultPrompt =
  "You are a teacher. Create flashcards from the provided file content.";

const _promptStorageKey = (courseId: number) => `courses-${courseId}-prompts`;

let _promptStorageInstance: Storage | null = null;

export const promptStorageInstance = () => {
  if (!_promptStorageInstance) {
    _promptStorageInstance = new Storage({
      area: "local",
    });
  }
  return _promptStorageInstance;
};

export const usePromptStorage = (courseId: number) => {
  const [_customPrompt, _setCustomPrompt, { remove, isLoading }] =
    useStorage<string>({
      key: _promptStorageKey(courseId),
      instance: promptStorageInstance(),
    });

  const customPrompt = _customPrompt || defaultPrompt;

  const setCustomPrompt = (prompt: string) => {
    if (prompt.trim() === "") {
      remove();
    } else {
      _setCustomPrompt(prompt);
    }
  };

  return [customPrompt, setCustomPrompt, { isLoading }] as const;
};

export const getPromptFromStorage = async (courseId?: number) => {
  if (!courseId) {
    return defaultPrompt;
  }

  const customPrompt = await promptStorageInstance().get<string>(
    _promptStorageKey(courseId)
  );
  return customPrompt || defaultPrompt;
};

export const setPromptToStorage = (courseId: number, prompt: string) => {
  if (prompt.trim() === "") {
    return promptStorageInstance().remove(_promptStorageKey(courseId));
  }

  return promptStorageInstance().set(_promptStorageKey(courseId), prompt);
};
