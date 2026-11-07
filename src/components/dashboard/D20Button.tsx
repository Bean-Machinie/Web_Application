import { useState } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "motion/react"
import { D20Icon } from "@/components/icons/D20Icon"
import { Button } from "@/components/ui/button"

type Props = { children: ReactNode; to?: string; onClick?: () => void }

// The hero's primary button: a small d20 in front of the label that tumbles, with a slight
// bounce, while the button is hovered or focused.
export function D20Button({ children, to, onClick }: Props) {
  const reduced = useReducedMotion()
  const [on, setOn] = useState(false)
  const hover = { onPointerEnter: () => setOn(true), onPointerLeave: () => setOn(false), onFocus: () => setOn(true), onBlur: () => setOn(false) }
  const body = (
    <>
      <motion.span
        className="inline-flex"
        animate={on && !reduced ? { rotate: [0, 200, 360, 340, 360], y: [0, -4, 0, -1.5, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: on ? 0.5 : 0.15, ease: "easeOut" }}
      >
        <D20Icon className="size-4" />
      </motion.span>
      {children}
    </>
  )

  return to ? (
    <Button asChild size="sm" {...hover}>
      <Link to={to}>{body}</Link>
    </Button>
  ) : (
    <Button size="sm" onClick={onClick} {...hover}>
      {body}
    </Button>
  )
}
