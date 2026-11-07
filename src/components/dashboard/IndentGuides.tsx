import { INDENT_PX } from "@/lib/journal-drop"
import type { Guide } from "@/lib/journal-tree"

// The middle of the 16px chevron slot: where a level's trunk runs.
const TRUNK_PX = 8

const LINE = "bg-border pointer-events-none absolute w-px"

// The branches beside a row, one level each: a trunk under the chevron of the page above,
// which turns with a curve into the rows inside it. All of it lies in the indent, so it
// never meets the row's own background; the curve is the app's own corner radius.
// `reach` carries the row's own elbow on across the empty arrow slot of a page with no children.
export function IndentGuides({ guides, reach = 0 }: { guides: Guide[]; reach?: number }) {
  return guides.map((guide, level) => {
    const left = level * INDENT_PX + TRUNK_PX
    const turns = guide === "elbow" || guide === "elbowThrough"
    const extra = level === guides.length - 1 ? reach : 0
    return (
      <span key={level} aria-hidden>
        {guide === "through" && <span style={{ left }} className={`${LINE} inset-y-0`} />}
        {turns && (
          <span
            style={{ left, width: INDENT_PX - TRUNK_PX + extra }}
            className="border-border pointer-events-none absolute top-0 h-3.5 rounded-bl-md border-b border-l"
          />
        )}
        {guide === "elbowThrough" && <span style={{ left }} className={`${LINE} top-3.5 bottom-0`} />}
      </span>
    )
  })
}
