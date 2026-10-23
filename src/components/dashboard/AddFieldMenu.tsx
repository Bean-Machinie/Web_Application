import type { ReactNode } from "react"
import { AlignLeft, Gauge, Hash, List, Square } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FIELD_KINDS } from "@/lib/character-sheet"
import type { CharacterFieldType } from "@/lib/character-templates/types"

const ICONS: Record<CharacterFieldType, LucideIcon> = {
  stat: Hash,
  resource: Gauge,
  track: Square,
  list: List,
  text: AlignLeft,
}

// The short menu of what a field can be, like a block menu: an icon, a name and a line
// on what it is for. The trigger is whatever is passed, so a button or an empty state
// can open it.
export function AddFieldMenu({ onAdd, children }: { onAdd: (type: CharacterFieldType) => void; children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {FIELD_KINDS.map(({ type, label, hint }) => {
          const KindIcon = ICONS[type]
          return (
            <DropdownMenuItem key={type} onSelect={() => onAdd(type)} className="items-start gap-3 py-2">
              <KindIcon className="text-muted-foreground mt-0.5" />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-muted-foreground text-xs">{hint}</span>
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
