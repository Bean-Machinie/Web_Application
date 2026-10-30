import { useLayoutEffect, useRef } from "react"
import { animate as tween, AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react"
import type { SentencePart } from "@/lib/quick-sentence"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Props = {
  part: Extract<SentencePart, { type: "word" }>
  // False for the words the page opens with, which just appear.
  animate: boolean
  open: boolean
  onPick: (slot: string) => void
}

const SLOT = { duration: 0.18, ease: [0.2, 0, 0, 1] as const }
// The slot is padded 4px a side for the hover background and pulled back by the same, so in
// the line it is only as wide as its text.
const PAD = 8

// A word, in a slot that is always there. The slot's width is tweened to the width of what is
// in it, so the line follows frame by frame and an exiting word, which is absolute, takes no
// room. An option only being tried is the word at 40% opacity; choosing it raises the opacity
// and nothing else.
export function QuickTypedWord({ part, animate, open, onPick }: Props) {
  const { before, text, after, choices, ghost } = part
  const reduced = useReducedMotion()
  const measure = useRef<HTMLSpanElement>(null)
  const width = useMotionValue(0)
  const placed = useRef(false)
  const blur = reduced ? {} : { filter: "blur(4px)" }

  // The width to tween to is measured on a hidden copy of the text, in the same font. It is
  // inline-block because an observer never reports a change in an inline box.
  useLayoutEffect(() => {
    const copy = measure.current!
    let running: ReturnType<typeof tween> | undefined
    function fit() {
      const target = copy.getBoundingClientRect().width + PAD
      running?.stop()
      if (placed.current && !reduced) running = tween(width, target, SLOT)
      else width.jump(target)
      placed.current = true
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(copy)
    return () => {
      observer.disconnect()
      running?.stop()
    }
  }, [text, width, reduced])

  const button = (
    <motion.button
      type="button"
      aria-expanded={choices ? undefined : open}
      aria-hidden={ghost || undefined}
      tabIndex={ghost ? -1 : undefined}
      aria-label={`${text}. Change`}
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: ghost ? 0.4 : 1 }}
      transition={reduced ? { duration: 0 } : SLOT}
      onClick={choices ? undefined : () => onPick(part.slot)}
      className={cn(
        "text-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring absolute inset-0 cursor-pointer rounded-md px-1 text-left font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset",
        open && "bg-accent",
        ghost && "pointer-events-none"
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {text && (
          <motion.span key={text} initial={{ opacity: 0, ...blur }} animate={{ opacity: 1, filter: reduced ? undefined : "blur(0px)" }} exit={{ opacity: 0, ...blur }} transition={SLOT} className="inline-block whitespace-nowrap">
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )

  return (
    <>
      <motion.span initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>{before}</motion.span>
      <motion.span style={{ width }} className="relative -mx-1 inline-block overflow-clip px-1 align-baseline whitespace-nowrap">
        <span ref={measure} aria-hidden className="invisible inline-block font-semibold">{text || "​"}</span>
        {choices ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
            <DropdownMenuContent>
              {choices.map((choice) => (
                <DropdownMenuItem key={choice.slot} onSelect={() => onPick(choice.slot)}>
                  {choice.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          button
        )}
      </motion.span>
      <span>{after}</span>
    </>
  )
}
