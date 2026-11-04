import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

// The right edge of a pane while a tab is being dragged: dropping there sends the
// tab to a pane on the right, which a split makes if there is none.
export function JournalPaneEdge({ index }: { index: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: `edge:${index}` })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute inset-y-0 right-0 z-20 w-24 border-r-2 border-transparent transition-colors",
        isOver && "border-primary bg-primary/10"
      )}
    />
  )
}
