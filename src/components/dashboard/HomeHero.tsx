import { MotionConfig } from "motion/react"
import type { Campaign } from "@/lib/campaigns"
import { HomeHeroNew } from "./HomeHeroNew"
import { HomeHeroReturning } from "./HomeHeroReturning"

type Props = {
  // The campaign opened last; null for someone with none.
  campaign: Campaign | null
  onCreateCharacter: () => void
}

// The top card of Home, in two states: a way in for a new player, and the way back into the
// campaign for one who has played. Motion of every kind follows the reduced-motion setting.
export function HomeHero({ campaign, onCreateCharacter }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      {campaign ? <HomeHeroReturning campaign={campaign} /> : <HomeHeroNew onCreateCharacter={onCreateCharacter} />}
    </MotionConfig>
  )
}
