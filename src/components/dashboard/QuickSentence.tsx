import { useCallback, useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { sentenceOf } from "@/lib/quick-sentence"
import type { Slot } from "@/lib/quick-slots"
import type { QuickView } from "@/lib/quick-view"
import { QuickTypedWord } from "./QuickTypedWord"

type Props = { slots: Slot[]; view: QuickView; openId: string | null; onToggle: (slot: string) => void }

// The place of the next choice: a blinking bar, and a small prompt after it in the UI font.
function Caret({ lead, prompt, onClick }: { lead: string; prompt: string; onClick: () => void }) {
  const reduced = useReducedMotion()
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <span>{lead}</span>
      <motion.span
        aria-hidden
        animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
        className="bg-foreground -mb-[0.1em] inline-block h-[1em] w-0.5 align-baseline"
      />
      <button type="button" onClick={onClick} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-2 rounded-sm align-middle font-sans text-sm font-normal tracking-normal outline-none focus-visible:ring-2">
        {prompt}
      </button>
    </motion.span>
  )
}

// "I’m a small Human Fighter, once a Soldier." written as it is chosen: only what has been
// chosen, then a caret where the next choice goes. A chosen word opens its choice again.
export function QuickSentence({ slots, view, openId, onToggle }: Props) {
  const [live, setLive] = useState(false)
  const [busy, setBusy] = useState(0)
  const onBusy = useCallback((delta: number) => setBusy((count) => count + delta), [])
  // The words the page opens with are not typed; those chosen after are.
  useEffect(() => setLive(true), [])

  return (
    <h2 className="text-muted-foreground font-serif text-3xl/[1.6] font-normal tracking-tight">
      {sentenceOf(slots, view).map((part) => {
        if (part.type === "text") return <span key={part.key}>{part.text}</span>
        if (part.type === "caret") return busy === 0 && <Caret key={part.key} lead={part.lead} prompt={part.prompt} onClick={() => onToggle(part.slot)} />
        return <QuickTypedWord key={part.key} part={part} animate={live} open={openId === part.slot} onBusy={onBusy} onClick={() => onToggle(part.slot)} />
      })}
    </h2>
  )
}
