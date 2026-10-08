// Passed in router state by a link that wants the page it opens to lead back
// to it, instead of to the World list.
export type BackTo = { path: string; label: string }

export function readBackTo(state: unknown): BackTo | null {
  const candidate = (state as { backTo?: Partial<BackTo> } | null)?.backTo
  return typeof candidate?.path === "string" && typeof candidate.label === "string"
    ? { path: candidate.path, label: candidate.label }
    : null
}
