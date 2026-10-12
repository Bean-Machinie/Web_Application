import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const fade = "from-popover pointer-events-none absolute inset-x-0 z-10 h-6 to-transparent transition-opacity duration-150"

// A list that scrolls with a thin scrollbar that shows only while scrolling, and a soft fade at
// the edge that has more beyond it.
export function FadingScroll({ maxHeight, children }: { maxHeight: string; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState({ above: false, below: false })

  const measure = useCallback(() => {
    const view = box.current?.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")
    if (!view) return
    setMore({ above: view.scrollTop > 1, below: view.scrollTop + view.clientHeight < view.scrollHeight - 1 })
  }, [])

  useLayoutEffect(measure, [measure])

  return (
    <div ref={box} className="relative" onScrollCapture={measure}>
      <ScrollArea type="scroll" className="max-h-(--max) [&>[data-slot=scroll-area-viewport]]:max-h-[inherit]" style={{ "--max": maxHeight } as React.CSSProperties}>
        {children}
      </ScrollArea>
      <div className={cn(fade, "top-0 bg-gradient-to-b", more.above ? "opacity-100" : "opacity-0")} />
      <div className={cn(fade, "bottom-0 bg-gradient-to-t", more.below ? "opacity-100" : "opacity-0")} />
    </div>
  )
}
