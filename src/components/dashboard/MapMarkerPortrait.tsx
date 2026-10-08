import type { LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { SPRING } from "@/lib/map-marker-card"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  imageUrl: string | null
  Icon: LucideIcon
  revealed: boolean
  // False: the picture inside the round pin. True: the card's thumbnail.
  card: boolean
}

// The one picture that travels between the pin and the card's thumbnail slot.
// It is placed by hand in both states, so the shared layoutId has nothing to
// remount.
export function MapMarkerPortrait({ id, imageUrl, Icon, revealed, card }: Props) {
  return (
    <motion.div
      layoutId={`marker-portrait-${id}`}
      transition={{ layout: SPRING }}
      style={
        card
          ? { left: 12, top: 12, width: 48, height: 48, borderRadius: 8 }
          : { left: 2, top: 2, width: 36, height: 36, borderRadius: 18 }
      }
      className={cn(
        "absolute flex items-center justify-center overflow-hidden",
        card ? "bg-muted text-muted-foreground border" : "text-foreground"
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className={cn("size-full object-cover", !card && !revealed && "grayscale")}
        />
      ) : (
        // Its own layout keeps the icon at its size while the portrait scales.
        <motion.div layout className="flex">
          <Icon className="size-5" />
        </motion.div>
      )}
    </motion.div>
  )
}
