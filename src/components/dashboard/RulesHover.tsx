import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { GlossaryEntry } from "@/lib/character-templates/srd-5-2-1-glossary"
import { glossaryEntryFor } from "@/lib/glossary-terms"
import { GlossaryCardBody } from "./GlossaryCardBody"

const OPEN_MS = 300
const CLOSE_MS = 100

// The hover card of the underlined terms in a page. The terms are decorations, not elements of
// ours, so one card is anchored to whichever term the pointer is over.
export function RulesHover({ editor }: { editor: Editor }) {
  const [shown, setShown] = useState<{ entry: GlossaryEntry; rect: DOMRect; term: HTMLElement } | null>(null)
  const timer = useRef<number>(undefined)

  useEffect(() => {
    const dom = editor.view.dom
    const termAt = (event: Event) => (event.target as HTMLElement).closest<HTMLElement>("[data-glossary]")
    const later = (ms: number, then: () => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(then, ms)
    }
    const over = (event: MouseEvent) => {
      const term = termAt(event)
      const entry = term && glossaryEntryFor(term.dataset.glossary ?? "")
      if (!term || !entry) return
      later(shown?.term === term ? 0 : OPEN_MS, () => setShown({ entry, term, rect: term.getBoundingClientRect() }))
    }
    const out = (event: MouseEvent) => termAt(event) && later(CLOSE_MS, () => setShown(null))
    dom.addEventListener("mouseover", over)
    dom.addEventListener("mouseout", out)
    return () => {
      window.clearTimeout(timer.current)
      dom.removeEventListener("mouseover", over)
      dom.removeEventListener("mouseout", out)
    }
  }, [editor, shown])

  if (!shown) return null
  // The card stays while the pointer is on it, and closes a moment after it leaves.
  const onOpenChange = (open: boolean) => {
    window.clearTimeout(timer.current)
    if (!open) timer.current = window.setTimeout(() => setShown(null), CLOSE_MS)
  }

  return (
    <HoverCard open onOpenChange={onOpenChange}>
      {/* An empty box over the term, for the card to anchor to. */}
      <HoverCardTrigger asChild>
        <span aria-hidden className="pointer-events-none fixed" style={{ left: shown.rect.left, top: shown.rect.top, width: shown.rect.width, height: shown.rect.height }} />
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-w-[320px]">
        <GlossaryCardBody entry={shown.entry} />
      </HoverCardContent>
    </HoverCard>
  )
}
