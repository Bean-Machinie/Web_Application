import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const SCROLLING_MS = 800

const fade =
  "from-popover pointer-events-none absolute inset-x-0 h-6 to-transparent transition-opacity duration-150"

// The palette's results: always back at the top when the search changes, with
// a soft fade at an edge only when there is more to scroll to in that direction.
export function PaletteList({ resetKey, children }: { resetKey: string; children: ReactNode }) {
  const list = useRef<HTMLDivElement>(null)
  const stopped = useRef<number>(undefined)
  const [more, setMore] = useState({ above: false, below: false })

  const measure = useCallback(() => {
    const element = list.current
    if (!element) return
    const above = element.scrollTop > 1
    const below = element.scrollTop + element.clientHeight < element.scrollHeight - 1
    setMore((current) => (current.above === above && current.below === below ? current : { above, below }))
  }, [])

  useEffect(() => {
    list.current?.scrollTo({ top: 0 })
    measure()
  }, [resetKey, measure])

  // The list grows and shrinks with its results, and animates doing so.
  useEffect(() => {
    const element = list.current
    if (!element) return
    const watch = new ResizeObserver(measure)
    watch.observe(element)
    if (element.firstElementChild) watch.observe(element.firstElementChild)
    return () => watch.disconnect()
  }, [measure])

  function onScroll() {
    measure()
    // Marks the list as scrolling, so its scrollbar shows, without rendering.
    list.current?.setAttribute("data-scrolling", "true")
    window.clearTimeout(stopped.current)
    stopped.current = window.setTimeout(() => list.current?.removeAttribute("data-scrolling"), SCROLLING_MS)
  }

  return (
    <div className="relative min-h-0 flex-1">
      <CommandList ref={list} onScroll={onScroll}>
        {children}
      </CommandList>
      <div className={cn(fade, "top-0 bg-linear-to-b", more.above ? "opacity-100" : "opacity-0")} />
      <div className={cn(fade, "bottom-0 bg-linear-to-t", more.below ? "opacity-100" : "opacity-0")} />
    </div>
  )
}
