import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "motion/react"
import { useHeroParallax } from "@/hooks/use-hero-parallax"
import { D20Button } from "./D20Button"
import { HeroEmbers } from "./HeroEmbers"
import { InviteReveal } from "./InviteReveal"

const IMAGE = "/home/get-started.webp"

// For someone with no campaign yet: the picture fills the card, the words sit on the left over a
// soft gradient, embers rise from the campfire and the picture drifts a few pixels with the pointer.
export function HomeHeroNew({ onCreateCharacter }: { onCreateCharacter: () => void }) {
  const reduced = useReducedMotion()
  const { x, y, handlers } = useHeroParallax()
  const [missing, setMissing] = useState(false)

  return (
    <section {...(reduced ? {} : handlers)} className="bg-card relative h-40 overflow-hidden rounded-xl border">
      {!missing && (
        <motion.img
          src={IMAGE}
          alt=""
          onError={() => setMissing(true)}
          className="absolute inset-0 size-full scale-[1.04] object-cover"
          style={reduced ? undefined : { x, y }}
        />
      )}
      <div aria-hidden className="from-background via-background/70 absolute inset-0 bg-gradient-to-r to-transparent" />
      <HeroEmbers />
      <div className="relative flex h-full max-w-[40rem] flex-col justify-center gap-1 px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Your adventure starts here.</h2>
        <p className="text-muted-foreground">Make a hero, or follow your GM&apos;s invite.</p>
        <div className="mt-2 flex items-center gap-2">
          <D20Button onClick={onCreateCharacter}>Create a character</D20Button>
          <InviteReveal />
        </div>
        <Link to="/app/campaigns/new" className="text-muted-foreground hover:text-foreground mt-1 self-start text-xs transition-colors">
          or start your own campaign →
        </Link>
      </div>
    </section>
  )
}
