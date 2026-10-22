import { Link } from "react-router-dom"
import { ChevronDown, FileText, Map as MapIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { findSection } from "@/lib/library-sections"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"

type Props = {
  onMap: () => void
  onEntry: (kind: WorldEntryKind) => void
  className?: string
}

// The primary "New" button of Home, with what can be made. A campaign opens its own
// page; a map and an entry are made in your library.
export function NewMenu({ onMap, onEntry, className }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          New
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/app/campaigns/new">
            <Users />
            Campaign
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onMap}>
          <MapIcon />
          Map
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileText />
            Entry
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {findSection("world").makes.map((kind) => {
              const { label, icon: KindIcon } = WORLD_KINDS[kind]
              return (
                <DropdownMenuItem key={kind} onSelect={() => onEntry(kind)}>
                  <KindIcon />
                  {label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
