import { useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { motion, useInView } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { Member } from "@/lib/campaign-members"
import { initialsOf } from "@/lib/profile"
import { cn } from "@/lib/utils"
import { DottedSeal } from "./DottedSeal"
import { useTileHot } from "./tile-hot"

const ACCENT = "#a78bfa"
const PLACEHOLDERS = 5

type Ring = { radius: number; seconds: number; reverse: boolean }
const INNER: Ring = { radius: 26, seconds: 38, reverse: false }
const OUTER: Ring = { radius: 44, seconds: 60, reverse: true }

// Where on a ring an item sits, in percent of the orbit box.
const at = (radius: number, turn: number): CSSProperties => ({
  left: `${50 + radius * Math.cos(turn * 2 * Math.PI)}%`,
  top: `${50 + radius * Math.sin(turn * 2 * Math.PI)}%`,
})

// The party round a dotted seal, on two thin rings turning slowly (the avatars stay upright), or dots
// where there is no one yet. When the tile is hot an empty "+ you" place slides in on the outer ring.
export function CampaignOrbit({ members, className }: { members: Member[] | undefined; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box)
  const hot = useTileHot()
  const reduced = useReducedMotion()
  const people: (Member | null)[] = members && members.length > 0 ? members.slice(0, 7) : Array(PLACEHOLDERS).fill(null)
  const inner = people.slice(0, 3)
  const outer = people.slice(3)
  const turning = (ring: Ring, backwards: boolean): CSSProperties =>
    reduced ? {} : { animation: `spin ${ring.seconds}s linear infinite ${backwards ? "reverse" : "normal"} ${inView ? "running" : "paused"}` }
  const spin = (ring: Ring) => turning(ring, ring.reverse)
  // Turned back as fast as its ring turns, so what is on it stays upright.
  const upright = (ring: Ring) => turning(ring, !ring.reverse)

  const ring = (spec: Ring, items: ReactNode[]) => (
    <div className="absolute inset-0" style={spin(spec)}>
      <div className="border-foreground/15 absolute rounded-full border" style={{ inset: `${50 - spec.radius}%` }} />
      {items.map((item, index) => (
        <div key={index} className="absolute -translate-x-1/2 -translate-y-1/2" style={at(spec.radius, index / items.length)}>
          <div style={upright(spec)}>{item}</div>
        </div>
      ))}
    </div>
  )

  const face = (person: Member | null) =>
    person ? (
      <Avatar size="sm" className="ring-card ring-2">
        {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
        <AvatarFallback className="text-[10px]">{initialsOf(person.username ?? "") || "?"}</AvatarFallback>
      </Avatar>
    ) : (
      <span className="bg-foreground/40 block size-2.5 rounded-full" />
    )

  const you = (
    <motion.span
      initial={false}
      animate={hot ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 28, scale: 0.6 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
      className="flex h-6 items-center rounded-full border border-dashed px-2 text-[10px] font-medium whitespace-nowrap"
      style={{ borderColor: ACCENT, color: ACCENT }}
    >
      + you
    </motion.span>
  )

  return (
    <div ref={box} className={cn("aspect-square", className)}>
      <div className="relative size-full">
        <DottedSeal className="absolute top-1/2 left-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2" />
        {ring(INNER, inner.map(face))}
        {/* The last place of the outer ring is kept for "+ you". */}
        {ring(OUTER, [...outer.map(face), you])}
      </div>
    </div>
  )
}
