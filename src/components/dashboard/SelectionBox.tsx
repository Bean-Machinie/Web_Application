import type { SelectionRect } from "@/hooks/use-selection-box"

// The rubber band drawn while dragging across empty space.
export function SelectionBox({ box }: { box: SelectionRect | null }) {
  if (!box) return null

  return (
    <div
      aria-hidden
      className="border-primary/70 bg-primary/10 pointer-events-none absolute z-30 rounded-sm border"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    />
  )
}
