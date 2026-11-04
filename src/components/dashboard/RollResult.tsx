import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { MODE_NAMES, notation } from "@/lib/dice"
import { CRITICAL_COLOR, FUMBLE_COLOR, momentOf, tintOf } from "@/lib/dice-result"
import type { ShownTotal } from "@/hooks/use-roll-presenter"
import { MomentWord } from "./MomentWord"
import { RollBreakdown } from "./RollBreakdown"
import { RollTotal } from "./RollTotal"

const MOMENT_COLORS = { critical: CRITICAL_COLOR, fumble: FUMBLE_COLOR }

// The result of a roll over the bottom of the screen, as the dice settle; a new roll replaces it, and
// Escape sends it away. It is drawn into the page body, out of the way of the pointer.
export function RollResult({ shown, onDismiss }: { shown: ShownTotal | null; onDismiss: () => void }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!shown?.visible) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onDismiss()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shown?.visible, onDismiss])

  if (!shown) return null
  const { roll, visible } = shown
  const moment = momentOf(roll)
  const color = moment ? MOMENT_COLORS[moment] : tintOf(roll)
  // One die and no modifier: the breakdown would only repeat the total.
  const plain = roll.sides !== 100 && roll.dice.length === 1 && roll.modifier === 0
  const label = roll.mode === "normal" ? notation(roll) : MODE_NAMES[roll.mode]

  return createPortal(
    <>
      {/* A light blur behind the figures, strongest at the bottom edge and fading to nothing
          upward, across the whole width so it has no edges to see. It is its own layer, not
          inside the one that fades: a blur under a half-transparent parent shows nothing
          until the parent is whole, and then it would pop. Its strength is what animates. */}
      <motion.div
        aria-hidden
        initial={{ backdropFilter: "blur(0px)" }}
        animate={{ backdropFilter: visible ? "blur(3px)" : "blur(0px)" }}
        transition={{ duration: visible ? 0.6 : 0.5, ease: "easeOut" }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[109] h-56 [mask-image:linear-gradient(to_top,black_25%,transparent)]"
      />
      <motion.div
          key={roll.id}
        role="status"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: visible ? 0.3 : 0.5 }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[110]"
      >
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/60 to-transparent" />
      <motion.div
          initial={{ y: reduced ? 0 : 8 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative mb-24 flex flex-col items-center gap-1 text-center"
          style={{ color }}
        >
          <p className="text-xs tracking-[0.3em] text-white/60 uppercase">{label}</p>
          {moment && <MomentWord moment={moment} reduced={reduced} />}
          <RollTotal roll={roll} moment={moment} reduced={reduced} />
          {plain ? null : (
            <p className="text-xs tabular-nums text-white/60">
              <RollBreakdown roll={roll} />
            </p>
          )}
        </motion.div>
      </motion.div>
      </>,
    document.body
  )
}
