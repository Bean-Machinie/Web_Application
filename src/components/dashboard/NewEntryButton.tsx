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

type Props = {
  // The active tab. Null on All, where the person picks the kind.
  kind: WorldEntryKind | null
  onPick: (kind: WorldEntryKind) => void
}

export function NewEntryButton({ kind, onPick }: Props) {
  if (kind) {
    return (
      <Button onClick={() => onPick(kind)}>
        <Plus className="size-4" />
        New {WORLD_KINDS[kind].label.toLowerCase()}
      </Button>
    )
  }

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
