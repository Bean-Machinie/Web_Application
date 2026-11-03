import { useEffect } from "react"
import { motion, useAnimate } from "motion/react"
import { NUMBER_CLASS } from "./roll-number"
import type { Roll } from "@/lib/dice"

// The number hangs from its top left corner, in percents of its box.
const PIVOT = { left: "6%", top: "2%" }

// The number hangs by its top left corner. It rattles, comes loose on the right and swings in a long, slowly
// dying sway; later it slips and hangs crooked. It stays in view throughout.
export function FumbleNumber({ roll, reduced }: { roll: Roll; reduced: boolean }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>()

  useEffect(() => {
    if (reduced) return
    const rattle = animate(scope.current, { rotate: [0, -1.8, 1.8, -1.2, 0.8, 0] }, { delay: 0.4, duration: 0.3 })
    const give = setTimeout(() => animate(scope.current, { rotate: 17 }, { type: "spring", stiffness: 45, damping: 2.6, mass: 1.2 }), 700)
    const slip = setTimeout(() => animate(scope.current, { rotate: 24, y: 7 }, { type: "spring", stiffness: 70, damping: 4.5 }), 1800)
    return () => {
      rattle.stop()
      clearTimeout(give)
      clearTimeout(slip)
    }
  }, [animate, scope, reduced])

  if (reduced) return <span className={NUMBER_CLASS}>{roll.total}</span>
  return (
    <span className={`relative inline-block ${NUMBER_CLASS}`}>
      <motion.span
        ref={scope}
        className="inline-block"
        style={{ transformOrigin: `${PIVOT.left} ${PIVOT.top}` }}
        initial={{ scale: 1.12, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
      >
        {roll.total}
      </motion.span>
    </span>
  )
}
