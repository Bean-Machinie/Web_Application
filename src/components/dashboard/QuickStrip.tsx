import { useRef } from "react"
import type { KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { QUICK_KINDS } from "@/lib/quick-options"
import type { Slot } from "@/lib/quick-slots"
import { QuickStripCard } from "./QuickStripCard"

type Props = {
  // The slot whose options are shown, or none.
  slot: Slot | null
  onSelect: (id: string) => void
  onLearn: (id: string) => void
  onPreview: (id: string | null) => void
}

// The options of the open slot as a row that scrolls sideways: with arrow buttons that show
// on hover, and the keyboard's arrow keys moving between the cards. It opens and closes by height.
export function QuickStrip({ slot, onSelect, onLearn, onPreview }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const learnable = slot !== null && (QUICK_KINDS as string[]).includes(slot.kind)

  const scroll = (direction: 1 | -1) =>
    scroller.current?.scrollBy({ left: direction * scroller.current.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" })

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    const cards = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-option] > button")]
    const next = cards[cards.indexOf(document.activeElement as HTMLButtonElement) + (event.key === "ArrowRight" ? 1 : -1)]
    if (!next) return
    event.preventDefault()
    next.focus()
  }

  return (
    <AnimatePresence initial={false}>
      {slot && (
        <motion.section
          key={slot.id}
          aria-label={`Options for ${slot.placeholder}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="group/strip relative overflow-hidden"
        >
          <div ref={scroller} onKeyDown={onKeyDown} className="flex snap-x gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:thin]">
            {slot.options.map((option) => (
              <QuickStripCard
                key={option.id}
                slotId={slot.id}
                kind={slot.kind}
                option={option}
                selected={slot.chosen === option.id}
                onLearn={learnable ? () => onLearn(option.id) : undefined}
                onSelect={() => onSelect(option.id)}
                onPreview={(on) => onPreview(on ? option.id : null)}
              />
            ))}
          </div>
          {(["left", "right"] as const).map((side) => (
            <Button
              key={side}
              variant="secondary"
              size="icon"
              aria-label={side === "left" ? "Scroll options left" : "Scroll options right"}
              tabIndex={-1}
              onClick={() => scroll(side === "left" ? -1 : 1)}
              className={`absolute top-1/2 ${side === "left" ? "left-1" : "right-1"} -translate-y-1/2 rounded-full opacity-0 shadow-md transition-opacity group-hover/strip:opacity-100 max-[600px]:hidden`}
            >
              {side === "left" ? <ChevronLeft /> : <ChevronRight />}
            </Button>
          ))}
        </motion.section>
      )}
    </AnimatePresence>
  )
}
