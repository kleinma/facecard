// Small helpers with no dependencies on React or storage.

/** A short, unique-enough id for a device-local app. */
export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/** Up to two initials from a name, for the fallback avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// A friendly, readable set of avatar background colors.
const AVATAR_COLORS = [
  '#4B7BEC',
  '#2E6F5E',
  '#C67C1E',
  '#B5495B',
  '#7A5FB0',
  '#3F8F8F',
  '#C0442E',
  '#556B2F',
];

/** Stable color for a name, so the same person always looks the same. */
export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a random element (assumes non-empty). */
export function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}
