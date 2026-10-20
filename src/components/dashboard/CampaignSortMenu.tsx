import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Sort, SortKey } from "@/lib/campaign-list"

const KEYS: { by: SortKey; label: string; asc: string; desc: string }[] = [
  { by: "name", label: "name", asc: "A to Z", desc: "Z to A" },
  { by: "created", label: "creation date", asc: "Oldest first", desc: "Newest first" },
]

// One button naming the current sort; each key opens a direction choice.
type Props = { sort: Sort; onSort: (sort: Sort) => void; className?: string }

export function CampaignSortMenu({ sort, onSort, className }: Props) {
  const current = KEYS.find((key) => key.by === sort.by)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" aria-label="Sort campaigns" className={cn("justify-start", className)}>
          <ArrowUpDown />
          <span className="truncate">Sorted by {current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {KEYS.map((key) => (
          <DropdownMenuSub key={key.by}>
            <DropdownMenuSubTrigger>Sort by {key.label}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={sort.by === key.by ? sort.dir : ""}
                onValueChange={(dir) => onSort({ by: key.by, dir: dir as Sort["dir"] })}
              >
                <DropdownMenuRadioItem value="asc">{key.asc}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">{key.desc}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
