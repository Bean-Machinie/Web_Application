import { motion, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import type { ReelCardData } from "@/lib/character-reel-cards"
import { reelPose, reelPosition } from "@/lib/reel-pose"
import { CharacterReelCard } from "./CharacterReelCard"

type Props = {
  card: ReelCardData
  index: number
  count: number
  offset: MotionValue<number>
  width: number
  height: number
}

// One card of the reel, placed each frame from the reel's position, around the reel's middle.
export function ReelSlot({ card, index, count, offset, width, height }: Props) {
  const pose = useTransform(() => reelPose(reelPosition(index, offset.get(), count), width, count))
  const x = useTransform(pose, (p) => p.x - width / 2)
  const opacity = useTransform(pose, (p) => p.opacity)
  const zIndex = useTransform(pose, (p) => p.zIndex)

  return (
    <motion.div className="pointer-events-auto absolute top-0 left-0 cursor-grab touch-pan-y select-none active:cursor-grabbing" style={{ width, height, x, y: -height / 2, opacity, zIndex }}>
      <CharacterReelCard card={card} />
    </motion.div>
  )
}
