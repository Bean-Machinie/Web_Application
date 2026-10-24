import { HoverIcon } from "@/components/icons/HoverIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

type Props = { kinds: WorldEntryKind[]; onPick: (kind: WorldEntryKind) => void }

// New for the section that is open: one kind is made at once, several are asked for.
export function LibraryNewButton({ kinds, onPick }: Props) {
  if (kinds.length === 1) {
    return (
      <Button onClick={() => onPick(kinds[0])}>
        <HoverIcon icon={PlusIcon} size={16} />
        New {WORLD_KINDS[kinds[0]].noun}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <HoverIcon icon={PlusIcon} size={16} />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {kinds.map((kind) => {
          const { label, icon: Icon } = WORLD_KINDS[kind]
          return (
            <DropdownMenuItem key={kind} onSelect={() => onPick(kind)}>
              <Icon />
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
