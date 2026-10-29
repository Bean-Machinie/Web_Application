import { useLayoutEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { SentencePart } from "@/lib/quick-sentence"
import { cn } from "@/lib/utils"

type Props = {
  part: Extract<SentencePart, { type: "word" }>
  // False for the words the page opens with, which are not typed.
  animate: boolean
  open: boolean
  // Told +1 when a word starts typing and -1 when it is done, so the next clause waits for it.
  onBusy: (delta: number) => void
  onClick: () => void
}

const MS_PER_CHARACTER = 25

// A chosen word with the plain words around it. A word that has just been chosen types in,
// the plain words with it; one that is changed retypes alone. With reduced motion it fades in.
export function QuickTypedWord({ part, animate, open, onBusy, onClick }: Props) {
  const { before, text, after } = part
  const reduced = useReducedMotion()
  // The word last shown whole; none until the first one has been typed.
  const [typedFor, setTypedFor] = useState<string | null>(animate && !reduced ? null : text)
  const [step, setStep] = useState(0)
  const typing = !reduced && typedFor !== text

  useLayoutEffect(() => {
    if (!typing) return
    onBusy(1)
    return () => onBusy(-1)
  }, [typing, onBusy])

  useLayoutEffect(() => {
    if (!typing) return
    let count = typedFor === null ? 0 : before.length
    setStep(count)
    const total = before.length + text.length
    const timer = window.setInterval(() => {
      count += 1
      setStep(count)
      if (count >= total) {
        window.clearInterval(timer)
        setTypedFor(text)
      }
    }, MS_PER_CHARACTER)
    return () => window.clearInterval(timer)
  }, [typing, text, typedFor, before.length])

  const shown = typing ? step : Infinity
  const word = text.slice(0, Math.max(0, shown - before.length))
  // A new word's closing punctuation comes when it is whole; a changed one keeps its own.
  const tail = typing && typedFor === null ? "" : after

  return (
    <>
      <span>{before.slice(0, shown)}</span>
      {word !== "" && (
        <motion.button
          key={reduced ? text : "word"}
          type="button"
          aria-expanded={open}
          aria-label={`${text}. Change`}
          initial={reduced && animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          onClick={onClick}
          className={cn(
            "text-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring -mx-1 cursor-pointer rounded-md px-1 font-semibold outline-none focus-visible:ring-2",
            open && "bg-accent"
          )}
        >
          {word}
        </motion.button>
      )}
      <span>{tail}</span>
    </>
  )
}
