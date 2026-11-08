import { useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { motion, useInView } from "motion/react"
import type { Transition } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { Member } from "@/lib/campaign-members"
import { initialsOf } from "@/lib/profile"
import { cn } from "@/lib/utils"
import { DottedSeal } from "./DottedSeal"
import { Sparks } from "./Sparks"
import type { Spark } from "./Sparks"
import { useTileHot } from "./tile-hot"

const ACCENT = "#a78bfa"
const PLACEHOLDERS = 5
const BOUNCE: Transition = { type: "spring", stiffness: 360, damping: 15 }
const SETTLE: Transition = { type: "spring", stiffness: 300, damping: 26 }
// How long after the hover starts the wave round the party reaches each one.
const WAVE = 0.06
const SPARKS: Spark[] = [
  { x: 0.36, y: 0.3, size: 9 },
  { x: 0.68, y: 0.36, size: 7 },
  { x: 0.62, y: 0.7, size: 8 },
  { x: 0.3, y: 0.62, size: 6 },
]

type Ring = { radius: number; seconds: number; reverse: boolean; grow: number }
const INNER: Ring = { radius: 26, seconds: 38, reverse: false, grow: 1.08 }
const OUTER: Ring = { radius: 44, seconds: 60, reverse: true, grow: 1.04 }

// Where on a ring an item sits, in percent of the orbit box.
const at = (radius: number, turn: number): CSSProperties => ({
  left: `${50 + radius * Math.cos(turn * 2 * Math.PI)}%`,
  top: `${50 + radius * Math.sin(turn * 2 * Math.PI)}%`,
})

// The party round a dotted seal, on two thin rings turning slowly (the avatars stay upright), or dots
// where there is no one yet. Pointed at, the seal turns and swells, the rings breathe out, a wave runs
// round the party, an empty "+ you" place pops in on the outer ring and a few sparks wink.
export function CampaignOrbit({ members, className }: { members: Member[] | undefined; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const hot = useTileHot()
  const reduced = useReducedMotion()
  const people: (Member | null)[] = members && members.length > 0 ? members.slice(0, 7) : Array(PLACEHOLDERS).fill(null)
  const turning = (ring: Ring, backwards: boolean): CSSProperties =>
    reduced ? {} : { animation: `spin ${ring.seconds}s linear infinite ${backwards ? "reverse" : "normal"} ${inView ? "running" : "paused"}` }
  const after = (delay: number): Transition => (reduced ? { duration: 0 } : hot ? { ...BOUNCE, delay } : SETTLE)

  const ring = (spec: Ring, items: ReactNode[]) => (
    <motion.div className="absolute inset-0" initial={false} animate={{ scale: hot ? spec.grow : 1 }} transition={after(0)}>
      <div className="absolute inset-0" style={turning(spec, spec.reverse)}>
        <div className="border-foreground/15 absolute rounded-full border" style={{ inset: `${50 - spec.radius}%` }} />
        {items.map((item, index) => (
          <div key={index} className="absolute -translate-x-1/2 -translate-y-1/2" style={at(spec.radius, index / items.length)}>
            {/* Turned back as fast as its ring turns, so it stays upright. */}
            <div style={turning(spec, !spec.reverse)}>{item}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )

  const face = (person: Member | null, order: number) => (
    <motion.div initial={false} animate={hot && !reduced ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.45, delay: 0.1 + order * WAVE, ease: "easeOut" }}>
      {person ? (
        <Avatar size="sm" className="ring-card ring-2">
          {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
          <AvatarFallback className="text-[10px]">{initialsOf(person.username ?? "") || "?"}</AvatarFallback>
        </Avatar>
      ) : (
        <span className="bg-foreground/40 block size-2.5 rounded-full" />
      )}
    </motion.div>
  )

  const you = (
    <motion.span
      initial={false}
      animate={hot ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={after(0.15 + people.length * WAVE)}
      className="bg-card flex h-6 items-center rounded-full border border-dashed px-2 text-[10px] font-medium whitespace-nowrap"
      style={{ borderColor: ACCENT, color: ACCENT }}
    >
      + you
    </motion.span>
  )

  const faces = people.map(face)
  return (
    <div ref={box} className={cn("aspect-square", className)}>
      <div className="relative size-full">
        <motion.div className="absolute top-1/2 left-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2" initial={false} animate={{ scale: hot ? 1.12 : 1, rotate: hot ? 45 : 0 }} transition={after(0)}>
          <DottedSeal className="size-full" />
        </motion.div>
        {ring(INNER, faces.slice(0, 3))}
        {/* The last place of the outer ring is kept for "+ you". */}
        {ring(OUTER, [...faces.slice(3), you])}
        <Sparks hot={hot} sparks={SPARKS} delay={0.35} />
      </div>
    </div>
  )
}
