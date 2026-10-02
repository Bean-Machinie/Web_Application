import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WORLD_KINDS, worldKinds } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

// Always asks for the kind, whichever tab is open: the new entry lands in its
// own tab, not the one you are looking at.
export function NewEntryButton({ onPick }: { onPick: (kind: WorldEntryKind) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {worldKinds.map((option) => {
          const { label, icon: KindIcon } = WORLD_KINDS[option]
          return (
            <DropdownMenuItem key={option} onSelect={() => onPick(option)}>
              <KindIcon />
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
