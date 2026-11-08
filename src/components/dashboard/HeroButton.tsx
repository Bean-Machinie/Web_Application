import { useState } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"

type Props = { children: ReactNode; to?: string; onClick?: () => void }

// The main button of a card, made to be the first thing seen: tall and wide, in the primary colour with a
// lit top edge and a glow beneath it, and a band of light that sweeps across it every few seconds. On
// hover it lifts, the light goes faster and the arrow runs ahead; pressed, it sinks. With reduced
// motion it is just the button.
export function HeroButton({ children, to, onClick }: Props) {
  const reduced = useReducedMotion()
  const [on, setOn] = useState(false)
  const hover = { onPointerEnter: () => setOn(true), onPointerLeave: () => setOn(false), onFocus: () => setOn(true), onBlur: () => setOn(false) }

  const body = (
    <>
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ["0%", "480%"] }}
          transition={{ duration: on ? 0.7 : 1.1, ease: "easeInOut", repeat: Infinity, repeatDelay: on ? 0.3 : 2.6 }}
        />
      )}
      <span className="relative">{children}</span>
      <motion.span className="relative inline-flex" animate={{ x: on && !reduced ? 5 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
        <ArrowRight className="size-5" />
      </motion.span>
    </>
  )

  const look =
    "relative h-12 gap-2.5 overflow-hidden rounded-lg px-7 text-base font-semibold shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--primary)_75%,transparent),inset_0_1px_0_rgb(255_255_255/0.4)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_color-mix(in_oklab,var(--primary)_85%,transparent),inset_0_1px_0_rgb(255_255_255/0.5)] active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"

  return to ? (
    <Button asChild size="lg" className={look} {...hover}>
      <Link to={to}>{body}</Link>
    </Button>
  ) : (
    <Button size="lg" className={look} onClick={onClick} {...hover}>
      {body}
    </Button>
  )
}
