import { INDENT_PX } from "@/lib/journal-drop"

// The middle of the 20px chevron slot: where a level's guide line runs.
const GUIDE_OFFSET_PX = 10

// One 1px line per level, in the indent beside a row and under the chevron of the page it
// belongs to, so it never meets the row's own background. Put inside a relative row.
export function IndentGuides({ depth }: { depth: number }) {
  return Array.from({ length: depth }, (_, level) => (
    <span
      key={level}
      aria-hidden
      style={{ left: level * INDENT_PX + GUIDE_OFFSET_PX }}
      className="bg-border pointer-events-none absolute inset-y-0 w-px"
    />
  ))
}
