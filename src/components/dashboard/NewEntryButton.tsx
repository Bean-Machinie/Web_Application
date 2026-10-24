import { HoverIcon } from "@/components/icons/HoverIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { useWorldScope } from "./useWorldScope"

// Always asks for the kind, whichever tab is open: the new entry lands in its
// own tab, not the one you are looking at.
export function NewEntryButton({ onPick }: { onPick: (kind: WorldEntryKind) => void }) {
  const { kinds } = useWorldScope()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button>
              <HoverIcon icon={PlusIcon} size={16} />
              New
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Create an entry</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {kinds.map((option) => {
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
