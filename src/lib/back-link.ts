import type { Crumb } from "./breadcrumbs"

// Passed in router state by a link that wants the page it opens to lead back
// to it, instead of to the World list. "before" is the trail that led to that
// page, so a chain of maps keeps every step.
export type BackTo = { path: string; label: string; before?: Crumb[] }

export function readBackTo(state: unknown): BackTo | null {
  const candidate = (state as { backTo?: Partial<BackTo> } | null)?.backTo
  return typeof candidate?.path === "string" && typeof candidate.label === "string"
    ? {
        path: candidate.path,
        label: candidate.label,
        before: Array.isArray(candidate.before) ? candidate.before : undefined,
      }
    : null
}
