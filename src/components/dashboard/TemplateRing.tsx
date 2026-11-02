import { useCallback, useEffect, useState } from "react"
import { useMotionValue } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useElementSize } from "@/hooks/use-element-size"
import { useRingCarousel } from "@/hooks/use-ring-carousel"
import { useRingDrag } from "@/hooks/use-ring-drag"
import { useRingWheel } from "@/hooks/use-ring-wheel"
import { cardWidthFor, riseFor } from "@/lib/ring-layout"
import type { CampaignTemplate, TemplateEntry } from "@/lib/campaign-template-types"
import { portraitUrl } from "@/lib/template-portraits"
import { TemplateEntryCard } from "./TemplateEntryCard"
import { TemplateRingItem } from "./TemplateRingItem"

type Props = { template: CampaignTemplate; entries: TemplateEntry[] }

// The ring is a share of the stage's width, and never so tight that neighbours pile up.
const SHARE_OF_WIDTH = 0.34
const MAX_RADIUS = 560
const MIN_RADIUS_PER_CARD = 1.1
// Dragging this far, as a share of the ring's radius, turns it one card.
const DRAG_PER_CARD = 0.5

const ARROW = "bg-card absolute top-1/2 z-[200] -translate-y-1/2 rounded-full shadow-xs"

// The entries as a ring that goes round: one in front, the rest circling behind it. The
// buttons, the wheel, the arrow keys and dragging turn it, and a card at the side comes to
// the front when pressed. The cards are as large as the stage's height allows.
export function TemplateRing({ template, entries }: Props) {
  const { ref: stage, size } = useElementSize<HTMLDivElement>()
  const radius = useMotionValue(MAX_RADIUS)
  const rise = useMotionValue(0)
  const [peek, setPeek] = useState<number | null>(null)
  const closePeek = useCallback(() => setPeek(null), [])
  const { angle, active, go, goTo, moveTo, onKeyDown } = useRingCarousel({
    count: entries.length,
    onTurn: closePeek,
  })
  useRingWheel(stage, go)
  const drag = useRingDrag({
    angle,
    moveTo,
    pixelsPerCard: () => radius.get() * DRAG_PER_CARD,
    onGrab: closePeek,
  })

  const width = cardWidthFor(size.height)
  useEffect(() => {
    const wide = Math.min(Math.max(size.width * SHARE_OF_WIDTH, width * MIN_RADIUS_PER_CARD), MAX_RADIUS)
    radius.set(wide)
    rise.set(riseFor(width))
  }, [size.width, width, radius, rise])

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
      {...drag}
      className="focus-visible:ring-ring relative min-h-0 w-full flex-1 touch-pan-y overflow-hidden rounded-lg outline-none select-none focus-visible:ring-2"
    >
      {entries.map((entry, index) => (
        <TemplateRingItem
          key={entry.name}
          index={index}
          count={entries.length}
          angle={angle}
          radius={radius}
          rise={rise}
          width={width}
        >
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
