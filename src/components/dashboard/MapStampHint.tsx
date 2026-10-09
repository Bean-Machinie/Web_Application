import { MousePointerClick } from "lucide-react"
import { cn } from "@/lib/utils"

// While art is picked up to be stamped: a small label over the bottom of the canvas,
// like a tooltip. It is over the map, not in the panel, so nothing moves to make room,
// and it fades and slides in and out instead of appearing. It never takes a click.
// "inset" is how much of the canvas, from the left, the tool panel lies over: the label is
// in the middle of what is left, as the map is when it is fitted.
export function MapStampHint({ show, inset }: { show: boolean; inset: number }) {
  return (
    <div
      aria-hidden={!show}
      style={{ left: `calc(${inset}px + (100% - ${inset}px) / 2)` }}
      className={cn(
        "bg-background text-muted-foreground pointer-events-none absolute bottom-4 z-10 flex h-8 -translate-x-1/2 items-center gap-2 rounded-md border px-3 text-xs whitespace-nowrap shadow-sm transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <MousePointerClick className="size-3.5" />
      Click the map to stamp
      <span className="bg-muted text-foreground rounded border px-1.5 py-0.5 text-[10px] leading-none font-medium">Esc</span>
      to stop
    </div>
  )
}
