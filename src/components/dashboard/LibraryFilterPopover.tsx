import { ListFilter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { Recency } from "@/lib/library-recency"

type Props = { recency: Recency; onRecency: (recency: Recency) => void }

// The library's filters in one place; for now when an entry was last changed.
export function LibraryFilterPopover({ recency, onRecency }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          Filter
          {recency !== "any" && <Badge className="ml-0.5 h-4 min-w-4 px-1">1</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="grid gap-2">
          <Label className="text-muted-foreground text-xs font-medium">Last changed</Label>
          <SegmentedControl
            aria-label="Last changed"
            value={recency}
            onValueChange={onRecency}
            options={[
              { value: "any", label: "Any time" },
              { value: "week", label: "7 days" },
              { value: "month", label: "30 days" },
            ]}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
