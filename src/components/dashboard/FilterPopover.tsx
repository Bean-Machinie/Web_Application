import { ListFilter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl } from "@/components/ui/segmented-control"

export type FilterGroup = {
  label: string
  value: string
  // The first is "no filter": all, any time.
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

// Every filter in the app: one quiet "Filter" button, and under it a small popover with a
// sliding segmented control for each thing to filter by. A page with more to filter by
// just passes more groups; the popover gets deeper, the button stays the same size. The
// button counts the filters that are on, and each group has its own "Reset" while it is on.
export function FilterPopover({ groups }: { groups: FilterGroup[] }) {
  const active = groups.filter((group) => group.value !== group.options[0].value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          Filter
          {/* A box of one size whatever is in it, so the button is the same size with a count or
              without, and the row does not move when a count appears. */}
          <span className="ml-0.5 flex size-4 items-center justify-center">
            {active.length > 0 && (
              // Not the Badge, whose padding and line height sit the digit off centre. In this font the
              // digit sits a little above the middle of its line, so it is lowered half a pixel.
              <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full pt-px text-[10px] leading-none font-medium tabular-nums">
                {active.length}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      {/* Not focused on open, which would put a ring on the first button before anyone pressed it. */}
      <PopoverContent align="end" className="w-80 gap-4 p-3" onOpenAutoFocus={(event) => event.preventDefault()}>
        {groups.map((group) => {
          const on = group.value !== group.options[0].value
          return (
            <div key={group.label} className="grid gap-2">
              <div className="flex h-4 items-center justify-between">
                <Label className="text-muted-foreground text-xs font-medium">{group.label}</Label>
                {on && (
                  <button
                    type="button"
                    onClick={() => group.onChange(group.options[0].value)}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-xs outline-none focus-visible:ring-2"
                  >
                    Reset
                  </button>
                )}
              </div>
              <SegmentedControl
                aria-label={group.label}
                value={group.value}
                onValueChange={group.onChange}
                options={group.options}
              />
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
