import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { TabPreview } from "@/lib/journal-preview"
import { cn } from "@/lib/utils"
import type { TabLabel } from "./journal-tab-kinds"

const PANEL_WIDTH_PX = 320
const PANEL_MAX_HEIGHT_PX = 240

// The lines of a page, small, fading out at the bottom where there is more.
function PreviewText({ preview }: { preview: TabPreview }) {
  const { image, lines } = preview
  return (
    <div className="relative max-h-56 overflow-hidden">
      {image && <img src={image} alt="" className="h-24 w-full object-cover" />}
      <div className="p-3">
      {lines.length === 0 ? (
        <p className="text-muted-foreground text-[11px] italic">Empty page</p>
      ) : (
        <div className="flex flex-col gap-1">
          {lines.map((line, index) => (
            <p
              key={index}
              className={cn(
                "line-clamp-2 text-[11px] leading-snug",
                line.heading ? "text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              {line.text}
            </p>
          ))}
        </div>
      )}
      </div>
      <div aria-hidden className="from-background absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent" />
    </div>
  )
}

type Props = {
  label: TabLabel
  // The panel of the tab, when it is the one showing: a small copy of it is carried.
  source: HTMLElement | null
  // A look at the tab that stands in for the panel when there is no copy of it to carry.
  preview?: { key: string; load: () => Promise<TabPreview> | null }
}

// The tab as it is carried, with its panel hanging from it as a small copy, so the
// whole thing is picked up and not only its title. The tab keeps the size and place
// of the one picked up, so it does not jump; it is lifted toward the screen by a
// slight growth and a shadow.
export function JournalTabOverlay({ label, source, preview }: Props) {
  const [lifted, setLifted] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const [looked, setLooked] = useState<TabPreview | null>(null)
  const Icon = label.icon

  // After the first paint, so the growth is seen.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLifted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Without a copy of the panel, a look at what the tab holds, fetched as it is lifted.
  useEffect(() => {
    if (source || !preview) return
    let current = true
    preview.load()?.then((loaded) => current && setLooked(loaded)).catch(() => {})
    return () => {
      current = false
    }
    // The same tab is the same look, however many times this is drawn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, preview?.key])

  // A copy of what the panel shows now, shrunk to fit and scrolled where it was.
  useLayoutEffect(() => {
    const holder = panel.current
    if (!holder || !source || source.clientWidth === 0) return
    const scale = PANEL_WIDTH_PX / source.clientWidth
    const copy = source.cloneNode(true) as HTMLElement
    copy.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"))
    copy.removeAttribute("data-journal-panel")
    copy.setAttribute("inert", "")
    Object.assign(copy.style, {
      width: `${source.clientWidth}px`,
      height: `${source.clientHeight}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      opacity: "1",
    })
    holder.style.height = `${Math.min(source.clientHeight * scale, PANEL_MAX_HEIGHT_PX)}px`
    holder.replaceChildren(copy)
    copy.scrollTop = source.scrollTop
  }, [source])

  return (
    <div className={cn("relative h-full w-full transition-[scale] duration-150 ease-out motion-reduce:transition-none", lifted && "scale-105")}>
      <div
        className={cn(
          "bg-background text-foreground flex h-full w-full cursor-grabbing items-center gap-1.5 rounded-md px-2.5 text-sm transition-shadow duration-150",
          lifted && "shadow-lg"
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{label.title}</span>
      </div>
      <div
        ref={panel}
        style={{ width: PANEL_WIDTH_PX }}
        className={cn(
          "bg-background pointer-events-none absolute top-full left-0 mt-1 overflow-hidden rounded-md transition-shadow duration-150",
          !source && !looked && "flex h-24 items-center justify-center",
          lifted && "ring-foreground/10 shadow-lg ring-1"
        )}
      >
        {!source && !looked && <label.icon className="text-muted-foreground size-8" />}
        {!source && looked && <PreviewText preview={looked} />}
      </div>
    </div>
  )
}
