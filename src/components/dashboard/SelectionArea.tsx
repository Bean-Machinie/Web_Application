import { useRef } from "react"
import type { ReactNode } from "react"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { useSelectionBox } from "@/hooks/use-selection-box"
import { SelectionBox } from "./SelectionBox"

const NOTHING: ReadonlySet<string> = new Set()

// Lets a list pick by dragging a box over empty space, as in a file manager. It takes over the
// page's side and bottom padding, so the box can also start in the margins and below the last
// row. The items inside carry data-entry-id. Pass null where nothing can be picked.
export function SelectionArea({ selection, children }: { selection: EntrySelection | null; children: ReactNode }) {
  const area = useRef<HTMLDivElement>(null)
  const { onPointerDown, box } = useSelectionBox({
    container: area,
    enabled: selection !== null,
    pageScroll: true,
    selected: selection?.selected ?? NOTHING,
    onSelect: (ids) => selection?.set(ids),
    onClear: () => selection?.clear(),
  })

  return (
    <div
      ref={area}
      onPointerDown={onPointerDown}
      className="relative -mx-4 -mb-4 flex flex-1 flex-col px-4 pb-4 md:-mx-6 md:-mb-6 md:px-6 md:pb-6"
    >
      <SelectionBox box={box} />
      {children}
    </div>
  )
}
