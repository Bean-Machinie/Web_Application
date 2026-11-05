import { useContext, useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import { Link, useNavigate } from "react-router-dom"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { KeyChips } from "@/components/ui/key-chips"
import { MODIFIER_KEY } from "@/lib/selection-hint"
import { ruleEntry, rulesPath } from "@/lib/rules-terms"
import type { RuleEntry } from "@/lib/srd-rules-types"
import { GlossaryCardBody } from "./GlossaryCardBody"
import { MentionOpenContext } from "./MentionOpenContext"
import { useRulesCampaign } from "./useRulesCampaign"

const OPEN_MS = 300
const CLOSE_MS = 100
const OPEN_LINK = "text-primary self-start text-xs hover:underline"

type Shown = { id: string; entry: RuleEntry; rect: DOMRect; term: HTMLElement }

// The underlined terms of a page: a click opens the term (beside in the journal, with Ctrl or Cmd
// in a new tab; on the Rules page elsewhere), and the pointer over one shows its hover card. The
// terms are decorations, not elements of ours, so one card is anchored to whichever the pointer is over.
export function RulesHover({ editor }: { editor: Editor }) {
  const campaign = useRulesCampaign()
  const openIn = useContext(MentionOpenContext)
  const navigate = useNavigate()
  const [shown, setShown] = useState<Shown | null>(null)
  const timer = useRef<number>(undefined)
  const campaignId = campaign?.id

  useEffect(() => {
    if (!campaignId) return
    const dom = editor.view.dom
    const termAt = (event: Event) => (event.target as HTMLElement).closest<HTMLElement>("[data-glossary]")
    const later = (ms: number, then: () => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(then, ms)
    }
    const over = (event: MouseEvent) => {
      const term = termAt(event)
      const id = term?.dataset.glossaryId
      const entry = ruleEntry(id)
      if (!term || !id || !entry) return
      later(shown?.term === term ? 0 : OPEN_MS, () => setShown({ id, entry, term, rect: term.getBoundingClientRect() }))
    }
    const out = (event: MouseEvent) => termAt(event) && later(CLOSE_MS, () => setShown(null))
    const click = (event: MouseEvent) => {
      const id = termAt(event)?.dataset.glossaryId
      // Only with Ctrl or Cmd: a plain click on the word is for editing the text around it.
      if (!id || !(event.ctrlKey || event.metaKey)) return
      window.clearTimeout(timer.current)
      setShown(null)
      if (!openIn) return navigate(rulesPath(campaignId, id))
      openIn(id, "other", "rule")
    }
    dom.addEventListener("mouseover", over)
    dom.addEventListener("mouseout", out)
    dom.addEventListener("click", click)
    return () => {
      window.clearTimeout(timer.current)
      dom.removeEventListener("mouseover", over)
      dom.removeEventListener("mouseout", out)
      dom.removeEventListener("click", click)
    }
  }, [editor, shown, campaignId, openIn, navigate])

  if (!shown || !campaignId) return null
  // The card stays while the pointer is on it, and closes a moment after it leaves.
  const onOpenChange = (open: boolean) => {
    window.clearTimeout(timer.current)
    if (!open) timer.current = window.setTimeout(() => setShown(null), CLOSE_MS)
  }
  const open = () => {
    setShown(null)
    openIn?.(shown.id, "other", "rule")
  }
  const footer = (
    <div className="flex items-baseline justify-between gap-3">
      {openIn ? (
        <button type="button" className={OPEN_LINK} onClick={open}>
          Open in rules
        </button>
      ) : (
        <Link to={rulesPath(campaignId, shown.id)} className={OPEN_LINK}>
          Open in rules
        </Link>
      )}
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <KeyChips keys={[MODIFIER_KEY, "Click"]} /> to open the rulebook
      </span>
    </div>
  )

  return (
    <HoverCard open onOpenChange={onOpenChange}>
      {/* An empty box over the term, for the card to anchor to. */}
      <HoverCardTrigger asChild>
        <span aria-hidden className="pointer-events-none fixed" style={{ left: shown.rect.left, top: shown.rect.top, width: shown.rect.width, height: shown.rect.height }} />
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-w-[320px]">
        <GlossaryCardBody entry={shown.entry} footer={footer} />
      </HoverCardContent>
    </HoverCard>
  )
}
