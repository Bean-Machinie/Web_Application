import { Check, Info } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import type { QuickOption } from "@/lib/quick-options"
import type { SlotKind } from "@/lib/quick-slots"
import { cn } from "@/lib/utils"
import { SLOT_ICONS } from "./quick-icons"

type Props = {
  slotId: string
  kind: SlotKind
  option: QuickOption
  selected: boolean
  // Learn more is only offered for the three main choices, which have details to show.
  onLearn?: () => void
  onSelect: () => void
  onPreview: (on: boolean) => void
}

// One option of the strip, about 180×220: its picture (or icon on a tinted surface), its name
// and a line of the SRD. Hovering or focusing it previews it on the character card.
export function QuickStripCard({ slotId, kind, option, selected, onLearn, onSelect, onPreview }: Props) {
  const Icon = SLOT_ICONS[kind]

  return (
    <motion.div
      layoutId={`card:${slotId}:${option.id}`}
      data-option
      className="group/option relative h-[220px] w-[180px] shrink-0 snap-start"
      onMouseEnter={() => onPreview(true)}
      onMouseLeave={() => onPreview(false)}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        onFocus={() => onPreview(true)}
        onBlur={() => onPreview(false)}
        className="focus-visible:ring-ring absolute inset-0 flex flex-col overflow-hidden rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <motion.span layoutId={`surface:${slotId}:${option.id}`} className={cn("bg-card absolute inset-0 rounded-xl border shadow-xs transition-colors group-hover/option:border-foreground/40", selected && "border-foreground")} />
        <span className="bg-muted/70 text-muted-foreground relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-t-xl">
          {option.image ? <img src={option.image} alt="" loading="lazy" className="size-full object-cover" /> : <Icon aria-hidden className="size-10" strokeWidth={1.25} />}
        </span>
        <span className="relative flex flex-col gap-0.5 p-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            {option.name}
            {selected && <Check aria-label="Chosen" className="size-3.5" />}
          </span>
          <span className="text-muted-foreground line-clamp-3 text-xs">{option.line}</span>
        </span>
      </button>
      {onLearn && (
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={`Learn more about ${option.name}`}
          onClick={onLearn}
          className="absolute top-2 right-2 size-7 rounded-full opacity-80 shadow-xs group-hover/option:opacity-100"
        >
          <Info />
        </Button>
      )}
    </motion.div>
  )
}
