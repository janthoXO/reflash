import { get } from "fast-levenshtein";

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
