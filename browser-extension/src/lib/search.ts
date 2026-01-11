import { get } from "fast-levenshtein";

/**
 * Performs a fuzzy search of the target string words within the source string words.
 * @param source
 * @param target
 * @returns
 */
export function fuzzySearch(source: string, target: string): boolean {
  const normalizedSource = source.toLowerCase();
  const normalizedTarget = target.toLowerCase();

  // Exact match or substring match
  if (normalizedSource.includes(normalizedTarget)) return true;

  const sourceWords = normalizedSource.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/).filter((w) => w.length > 0);

  // Check if all target words are present in the source (fuzzy or substring)
  return targetWords.every((tWord) => {
    const maxDistance = Math.max(1, Math.floor(tWord.length * 0.2));

    return sourceWords.some(
      (sWord) => sWord.includes(tWord) || get(sWord, tWord) <= maxDistance
    );
  });
}

/**
 * Performs a fuzzy search of the target string. Words which are matched by the target
 * strings words are transformed using the mapMatch function, while non-matched words
 * are transformed using the mapNoMatch function.
 * @param source
 * @param target
 * @param mapMatch
 * @param mapNoMatch
 * @returns
 */
export function fuzzySearchAndMap<T>(
  source: string,
  target: string,
  mapMatch: (part: string) => T,
  mapNoMatch: (part: string) => T
): T[] {
  if (!target.trim()) {
    return [mapNoMatch(source)];
  }

  const targetWords = target
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  // Split by whitespace, capturing the separators to preserve structure
  const parts = source.split(/(\s+)/);

  return parts.map((part) => {
    // Skip matching for whitespace-only parts
    if (!part.trim()) {
      return mapNoMatch(part);
    }

    const normalizedPart = part.toLowerCase();
    const isMatch = targetWords.some((tWord) => {
      const maxDistance = Math.max(1, Math.floor(tWord.length * 0.2));
      return (
        normalizedPart.includes(tWord) ||
        get(normalizedPart, tWord) <= maxDistance
      );
    });

    return isMatch ? mapMatch(part) : mapNoMatch(part);
  });
}

/**
 * Performs an exact search of the target string words within the source string.
 * Replaces all occurrences of target words in the source with the result of mapMatch,
 * and all non-matching parts with the result of mapNoMatch.
 * @param source
 * @param target
 * @param mapMatch
 * @param mapNoMatch
 * @returns
 */
export function searchAndMap<T>(
  source: string,
  target: string,
  mapMatch: (part: string) => T,
  mapNoMatch: (part: string) => T
): T[] {
  if (!target.trim()) {
    return [mapNoMatch(source)];
  }

  const targetWords = target
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (targetWords.length === 0) {
    return [mapNoMatch(source)];
  }

  // Escape special regex characters
  const escapedWords = targetWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Sort by length descending to match longest words first
  escapedWords.sort((a, b) => b.length - a.length);

  // Create regex with capturing group to include matches in the split result
  const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

  // Split source by the regex. Capturing groups are included in the result.
  const parts = source.split(regex);

  return parts
    .filter((part) => part !== "") // Remove empty strings resulting from split at boundaries
    .map((part) => {
      const lowerPart = part.toLowerCase();
      // Check if this part is one of the target words
      const isMatch = targetWords.some((w) => w === lowerPart);
      return isMatch ? mapMatch(part) : mapNoMatch(part);
    });
}
