import { useEffect } from "react"
import type { RefObject } from "react"

// `key` is the tab it is for, as the panel names its tabs.
export type Flash = { text: string; n: number; key: string }

const NAME = "search-flash"
// Held at full strength, then eased out.
const HOLD_MS = 2200
const FADE_MS = 1600
const MAX_RANGES = 60

// Every place the text occurs in what is shown, or else every word of it.
function rangesOf(root: HTMLElement, text: string) {
  const phrase = text.trim().toLowerCase()
  const words = phrase.split(/\s+/).filter((word) => word.length > 2)
  for (const needles of [[phrase], words]) {
    const ranges: Range[] = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node && ranges.length < MAX_RANGES; node = walker.nextNode()) {
      const content = node.textContent?.toLowerCase() ?? ""
      for (const needle of needles) {
        for (let at = content.indexOf(needle); needle && at >= 0; at = content.indexOf(needle, at + needle.length)) {
          const range = new Range()
          range.setStart(node, at)
          range.setEnd(node, at + needle.length)
          ranges.push(range)
        }
      }
    }
    if (ranges.length > 0) return ranges
  }
  return []
}

// Lights up where a search found its words in what is open, brings the first into view, and lets
// the light fade away. It uses the browser's highlight painting, so the page itself is not touched.
// Where that is not supported nothing happens: the page is simply open.
export function useFlashText(box: RefObject<HTMLElement | null>, flash: Flash | null, showing: string) {
  useEffect(() => {
    const root = box.current
    if (!flash || flash.key !== showing || !root || typeof CSS === "undefined" || !("highlights" in CSS)) return
    let frame = 0
    let fade: Animation | undefined

    // Twice a frame, so what is open has been drawn before it is searched.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const ranges = rangesOf(root, flash.text)
        if (ranges.length === 0) return
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ranges[0].startContainer.parentElement?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" })

        CSS.highlights.set(NAME, new Highlight(...ranges))
        // The highlight's colour reads --flash-alpha from the box it is in, so animating that fades it.
        const total = HOLD_MS + FADE_MS
        fade = root.animate(
          [{ "--flash-alpha": 0.4 }, { "--flash-alpha": 0.4, offset: HOLD_MS / total }, { "--flash-alpha": 0 }],
          { duration: total, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
        )
        fade.onfinish = () => CSS.highlights.delete(NAME)
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      fade?.cancel()
      CSS.highlights.delete(NAME)
    }
  }, [box, flash, showing])
}
