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

// One button while there is a single kind; a menu of kinds once there are
// more. Nothing here changes when a kind is added to the registry.
export function NewEntryButton({ onPick }: { onPick: (kind: WorldEntryKind) => void }) {
  if (worldKinds.length === 1) {
    const kind = worldKinds[0]
    return (
      <Button onClick={() => onPick(kind)}>
        <Plus className="size-4" />
        New {WORLD_KINDS[kind].label}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New entry
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {worldKinds.map((kind) => {
          const { label, icon: KindIcon } = WORLD_KINDS[kind]
          return (
            <DropdownMenuItem key={kind} onSelect={() => onPick(kind)}>
              <KindIcon />
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
