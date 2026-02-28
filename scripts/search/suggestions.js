export function getTopSuggestions(suggestions = [], maxSuggestions = 3) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return [];

  const normalized = [];
  const seen = new Set();

  suggestions.forEach((value) => {
    if (normalized.length >= maxSuggestions) return;
    if (typeof value !== 'string') return;

    const suggestion = value.trim();
    if (!suggestion) return;

    const key = suggestion.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    normalized.push(suggestion);
  });

  return normalized;
}
