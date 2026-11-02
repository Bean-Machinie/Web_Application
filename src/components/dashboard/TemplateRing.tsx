import { useCallback, useEffect, useState } from "react"
import { useMotionValue } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useElementSize } from "@/hooks/use-element-size"
import { useRingCarousel } from "@/hooks/use-ring-carousel"
import type { CampaignTemplate, TemplateEntry } from "@/lib/campaign-template-types"
import { portraitUrl } from "@/lib/template-portraits"
import { TemplateEntryCard } from "./TemplateEntryCard"
import { TemplateRingItem } from "./TemplateRingItem"

type Props = { template: CampaignTemplate; entries: TemplateEntry[] }

// The ring is as wide as the room allows, within these.
const MIN_RADIUS = 110
const MAX_RADIUS = 360
const SHARE_OF_WIDTH = 0.34

const ARROW = "bg-card absolute top-1/2 z-[200] -translate-y-1/2 rounded-full shadow-xs"

// The entries as a ring that goes round: one in front, the rest circling behind it. The
// buttons, the wheel and the arrow keys turn it, and a card at the side comes to the front
// when pressed.
export function TemplateRing({ template, entries }: Props) {
  const { ref: stage, size } = useElementSize<HTMLDivElement>()
  const radius = useMotionValue(MAX_RADIUS)
  const [peek, setPeek] = useState<number | null>(null)
  const closePeek = useCallback(() => setPeek(null), [])
  const { angle, active, go, goTo, onKeyDown } = useRingCarousel({
    count: entries.length,
    stage,
    onTurn: closePeek,
  })

  useEffect(() => {
    radius.set(Math.min(Math.max(size.width * SHARE_OF_WIDTH, MIN_RADIUS), MAX_RADIUS))
  }, [size.width, radius])

  function press(index: number) {
    if (index !== active) goTo(index)
    else setPeek(peek === index ? null : index)
  }

  return (
    <div
      ref={stage}
      role="group"
      aria-roledescription="carousel"
      aria-label="Starter entries"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="focus-visible:ring-ring relative h-[380px] w-full overflow-hidden rounded-lg outline-none focus-visible:ring-2"
    >
      {entries.map((entry, index) => (
        <TemplateRingItem key={entry.name} index={index} count={entries.length} angle={angle} radius={radius}>
          <TemplateEntryCard
            entry={entry}
            imageUrl={portraitUrl(template, entry)}
            tip={index % 2 === 0 ? -3 : 3}
            open={peek === index}
            onPress={() => press(index)}
            onClose={closePeek}
          />
        </TemplateRingItem>
      ))}
      <Button type="button" variant="outline" size="icon" aria-label="Previous entry" onClick={() => go(-1)} className={`${ARROW} left-2`}>
        <ChevronLeft />
      </Button>
      <Button type="button" variant="outline" size="icon" aria-label="Next entry" onClick={() => go(1)} className={`${ARROW} right-2`}>
        <ChevronRight />
      </Button>
    </div>
  )
}
