import type { WorldEntry } from "./world-entries"

export type Recency = "any" | "week" | "month"

const DAYS: Record<Exclude<Recency, "any">, number> = { week: 7, month: 30 }

export const RECENCY_TEXT: Record<Exclude<Recency, "any">, string> = {
  week: "changed in the last 7 days",
  month: "changed in the last 30 days",
}

// The entries changed within the period.
export function changedWithin(entries: WorldEntry[], recency: Recency) {
  if (recency === "any") return entries
  const since = Date.now() - DAYS[recency] * 24 * 60 * 60 * 1000
  return entries.filter((entry) => new Date(entry.updatedAt).getTime() >= since)
}

// Newest change first.
export const newestFirst = (entries: WorldEntry[]) =>
  [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
