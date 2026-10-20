import { Plus } from "lucide-react"
import { Icon } from "@/components/Icon"
import { CommandItem } from "@/components/ui/command"
import type { PaletteItem, Visual } from "@/lib/palette-items"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { CampaignImage } from "./CampaignImage"
import { HighlightedText } from "./HighlightedText"

const tile =
  "bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border"

function Leading({ visual }: { visual: Visual }) {
  switch (visual.type) {
    case "campaign":
      return <CampaignImage name={visual.name} imageUrl={visual.imageUrl} className="size-7 rounded-md" />
    case "entry": {
      const KindIcon = WORLD_KINDS[visual.kind].icon
      return (
        <span className={tile}>
          {visual.imageUrl ? (
            <img src={visual.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <KindIcon className="size-4" />
          )}
        </span>
      )
    }
    case "page":
      return (
        <span className={tile}>
          <Icon src={visual.icon} />
        </span>
      )
    case "action":
      return (
        <span className={tile}>
          <Plus className="size-4" />
        </span>
      )
  }
}

export function PaletteRow({ item, onSelect }: { item: PaletteItem; onSelect: (item: PaletteItem) => void }) {
  return (
    <CommandItem value={item.id} onSelect={() => onSelect(item)}>
      <Leading visual={item.visual} />
      <span className="text-foreground/70 truncate">
        <HighlightedText text={item.name} matched={item.matched} />
      </span>
      <span className="text-muted-foreground ml-auto shrink-0 pl-3 text-xs">{item.context}</span>
    </CommandItem>
  )
}
