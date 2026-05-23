/**
 * Abbreviates a full Vietnamese name for compact display.
 * Null/empty input falls back to "Không xác định".
 * - 1 word  → as-is         ("Kiệt"                   → "Kiệt")
 * - 2 words → as-is         ("Bảo Vy"                 → "Bảo Vy")
 * - 3+ words → initial of second-to-last + ". " + last word
 *                            ("Nguyễn Quang Khánh Tâm" → "K. Tâm")
 */
export function abbreviateName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "Không xác định";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 3) return fullName;
  const secondToLast = parts[parts.length - 2];
  const last = parts[parts.length - 1];
  return `${secondToLast.charAt(0)}. ${last}`;
}

export function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return parts
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
