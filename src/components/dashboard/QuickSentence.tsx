import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { sentenceOf } from "@/lib/quick-sentence"
import type { Ghost } from "@/lib/quick-sentence"
import type { Slot } from "@/lib/quick-slots"
import { QuickTypedWord } from "./QuickTypedWord"

type Props = { slots: Slot[]; ghost: Ghost | null; openId: string | null; onToggle: (slot: string) => void }

// The place of the next choice: a blinking bar, and after it a small prompt in the UI font, or,
// beside a ghost word, the hint that Tab accepts it.
function Caret({ prompt, hint, onClick }: { prompt: string; hint: string; onClick: () => void }) {
  const reduced = useReducedMotion()
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <motion.span
        aria-hidden
        animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
        className="bg-foreground -mb-[0.1em] inline-block h-[1em] w-0.5 align-baseline"
      />
      {prompt && (
        <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} onClick={onClick} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-2 rounded-sm align-middle font-sans text-sm font-normal tracking-normal outline-none focus-visible:ring-2">
          {prompt}
        </motion.button>
      )}
      {!prompt && hint && <span className="text-muted-foreground ml-2 align-middle font-sans text-sm font-normal tracking-normal">{hint}</span>}
    </motion.span>
  )
}

// "I’m a Human Fighter, once a Soldier." written as it is chosen: only what has been
// chosen, then a caret where the next choice goes. A chosen word opens its choice again.
export function QuickSentence({ slots, ghost, openId, onToggle }: Props) {
  const [live, setLive] = useState(false)
  // The words the page opens with just appear; those chosen after fade in.
  useEffect(() => setLive(true), [])

  return (
    <h2 className="text-muted-foreground font-serif text-3xl/[1.6] font-normal tracking-tight">
      {sentenceOf(slots, ghost).map((part) => {
        if (part.type === "text") return <span key={part.key}>{part.text}</span>
        if (part.type === "caret") return <Caret key={part.key} prompt={part.prompt} hint={part.hint} onClick={() => onToggle(part.slot)} />
        const open = openId === part.slot || !!part.choices?.some((choice) => choice.slot === openId)
        return <QuickTypedWord key={part.key} part={part} animate={live} open={open} onPick={onToggle} />
      })}
    </h2>
  )
}
