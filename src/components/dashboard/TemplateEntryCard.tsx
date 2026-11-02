import { useState } from "react"
import { motion } from "motion/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import type { TemplateEntry } from "@/lib/campaign-template-types"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { KindLabel } from "./KindLabel"
import { TemplateEntryPreview } from "./TemplateEntryPreview"

type Props = {
  entry: TemplateEntry
  // Where the portrait would be; a missing file shows the kind's icon.
  imageUrl: string | null
  // Which way it tips on hover, in degrees.
  tip: number
  // Whether its small card is open.
  open: boolean
  onPress: () => void
  onClose: () => void
}

// A starter entry as a page of a magazine: on hover it snaps up and tips. Pressing it is
// up to the ring, which brings it to the front, or opens its small card if it is there.
export function TemplateEntryCard({ entry, imageUrl, tip, open, onPress, onClose }: Props) {
  const [broken, setBroken] = useState(false)
  const { icon: KindIcon } = WORLD_KINDS[entry.kind]

  return (
    <Popover open={open} onOpenChange={(next) => !next && onClose()}>
      <PopoverTrigger asChild>
        <motion.button
          type="button"
          // The popover would toggle itself; the ring decides.
          onClick={(event) => {
            event.preventDefault()
            onPress()
          }}
          whileHover={{ y: -10, rotate: tip, scale: 1.08 }}
          whileTap={{ scale: 0.97, rotate: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 18, mass: 0.6 }}
          className={`bg-card focus-visible:ring-ring relative flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border text-left shadow-sm outline-none hover:shadow-xl focus-visible:ring-2 ${tiltCardSkin()}`}
        >
          <span className="bg-muted text-muted-foreground relative flex aspect-square items-center justify-center overflow-hidden">
            {imageUrl && !broken ? (
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                onError={() => setBroken(true)}
                className="size-full object-cover"
              />
            ) : (
              <KindIcon className="size-9" />
            )}
          </span>
          <span className="flex flex-col gap-1 p-3">
            <span className="truncate font-medium">{entry.name}</span>
            <KindLabel kind={entry.kind} />
          </span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-72 p-4">
        <TemplateEntryPreview entry={entry} />
      </PopoverContent>
    </Popover>
  )
}
