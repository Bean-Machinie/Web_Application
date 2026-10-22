import { ListFilter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { VisibilityFilter } from "@/lib/world-list"

type Props = {
  visibility: VisibilityFilter
  onVisibility: (visibility: VisibilityFilter) => void
  // How many filters are on.
  active: number
}

// Every filter of the list in one place; for now only visibility. The ones that are
// on also show as chips under the toolbar.
export function WorldFilterPopover({ visibility, onVisibility, active }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          Filter
          {active > 0 && <Badge className="ml-0.5 h-4 min-w-4 px-1">{active}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="grid gap-2">
          <Label className="text-muted-foreground text-xs font-medium">Visibility</Label>
          <SegmentedControl
            aria-label="Visibility"
            value={visibility}
            onValueChange={onVisibility}
            options={[
              { value: "all", label: "All" },
              { value: "hidden", label: "Hidden" },
              { value: "revealed", label: "Revealed" },
            ]}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
