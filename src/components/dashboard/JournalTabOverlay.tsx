import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TabLabel } from "./journal-tab-kinds"

// The tab as it is carried: the same size and place as the one picked up, so it
// does not jump, then lifted toward the screen by a slight growth and a shadow.
// It never moves up or down on its own.
export function JournalTabOverlay({ label }: { label: TabLabel }) {
  const [lifted, setLifted] = useState(false)
  const Icon = label.icon

  // After the first paint, so the growth is seen.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLifted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={cn(
        "bg-background text-foreground flex h-full w-full cursor-grabbing items-center gap-1.5 rounded-sm px-2.5 text-sm transition-[scale,box-shadow] duration-150 ease-out motion-reduce:transition-none",
        lifted && "ring-foreground/10 scale-105 shadow-lg ring-1"
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label.title}</span>
    </div>
  )
}
