"use client";

function normalizeName(value?: string) {
  return (value ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
}

const CANONICAL_NAMES = [
  "ani",
  "arnav",
  "arav",
  "jake",
  "monica",
  "riya",
  "sanjana",
  "sarah",
  "sarthak",
  "shrey",
  "sid",
  "sithu",
  "suraj",
] as const;

export function isPlayerMatch(actual?: string, expected?: string) {
  const actualNormalized = normalizeName(actual);
  const expectedNormalized = normalizeName(expected);

  if (!actualNormalized || !expectedNormalized) return false;
  if (actualNormalized === expectedNormalized) return true;
  if (actualNormalized.includes(expectedNormalized)) return true;
  if (expectedNormalized.includes(actualNormalized)) return true;

  return false;
}

export function getCanonicalPlayerName(value?: string) {
  const normalized = normalizeName(value);
  if (!normalized) return "";

  for (const canonical of CANONICAL_NAMES) {
    if (normalized === canonical || normalized.includes(canonical) || canonical.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

export function getTokenOwner(token: string) {
  const normalized = normalizeName(token.replace(/_token$/i, "").replace(/_/g, " "));
  if (!normalized || normalized === "graveyarddone") return undefined;

  for (const canonical of CANONICAL_NAMES) {
    if (normalized === canonical || normalized.startsWith(canonical) || normalized.endsWith(canonical)) {
      return canonical;
    }
  }

  return undefined;
}
