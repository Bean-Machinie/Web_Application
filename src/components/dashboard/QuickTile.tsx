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
  // Small pickers (size, languages) have smaller tiles.
  compact: boolean
  // Learn more, for narrow screens where the detail panel is far below the tile.
  onLearn?: () => void
  onSelect: () => void
  onPreview: (on: boolean) => void
}

// One option: its picture (or icon on a tinted square) on the left, its name and a line of
// the SRD on the right. Hovering or focusing it previews it on the character card.
export function QuickTile({ slotId, kind, option, selected, compact, onLearn, onSelect, onPreview }: Props) {
  const Icon = SLOT_ICONS[kind]

  return (
    <motion.div layoutId={`card:${slotId}:${option.id}`} data-option className="relative" onMouseEnter={() => onPreview(true)} onMouseLeave={() => onPreview(false)}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        onFocus={() => onPreview(true)}
        onBlur={() => onPreview(false)}
        className={cn(
          "focus-visible:ring-ring group/tile relative flex w-full items-center gap-3 rounded-xl p-2.5 text-left outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2",
          onLearn && "max-[999px]:pr-9"
        )}
      >
        <motion.span
          layoutId={`surface:${slotId}:${option.id}`}
          className={cn("bg-card absolute inset-0 rounded-xl border shadow-xs transition-colors group-hover/tile:border-foreground/40", selected && "border-foreground bg-accent")}
        />
        <span className={cn("bg-muted text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg", compact ? "size-8" : "size-11")}>
          {option.image ? <img src={option.image} alt="" loading="lazy" className="size-full object-cover" /> : <Icon aria-hidden className={compact ? "size-4" : "size-5"} strokeWidth={1.5} />}
        </span>
        <span className="relative flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1 text-sm font-semibold">
            <span className="truncate">{option.name}</span>
            {selected && <Check aria-label="Chosen" className="size-3.5 shrink-0" />}
          </span>
          <span className="text-muted-foreground line-clamp-2 text-xs">{option.line}</span>
        </span>
      </button>
      {onLearn && (
        <Button variant="ghost" size="icon-sm" aria-label={`Learn more about ${option.name}`} onClick={onLearn} className="absolute top-1/2 right-1.5 size-7 -translate-y-1/2 rounded-full min-[1000px]:hidden">
          <Info />
        </Button>
      )}
    </motion.div>
  )
}
