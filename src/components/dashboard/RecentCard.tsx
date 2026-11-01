import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { RecentBy } from "@/lib/world-recent"
import { ScrollShadow } from "./ScrollShadow"

type Props = {
  // "Recent" unless said otherwise.
  title?: string
  // The Edited / Created switch; without them there is none.
  by?: RecentBy
  onBy?: (by: RecentBy) => void
  // The rows, or their skeleton.
  children: ReactNode
}

// The recent list as a panel made like the rules panel of the Character Creator's abilities: the
// title with the switch on its line, the rows scrolling between two
// hairlines, and the way to the library at the foot. The frame never changes while the rows
// inside it do: it takes the height of the column it is in, however many rows there are. On the
// wide layout it starts level with the tool cards, under the row of their heading.
export function RecentCard({ title = "Recent", by, onBy, children }: Props) {
  return (
    <section className="bg-popover text-popover-foreground ring-foreground/10 flex max-h-[480px] flex-col gap-4 overflow-hidden rounded-lg p-4 shadow-md ring-1 lg:absolute lg:inset-x-0 lg:top-11 lg:bottom-0 lg:max-h-none">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {by && onBy && (
          <SegmentedControl<RecentBy>
            size="sm"
            aria-label="Sort recent"
            value={by}
            onValueChange={onBy}
            options={[
              { value: "updated", label: "Edited" },
              { value: "created", label: "Created" },
            ]}
          />
        )}
      </header>
      <ScrollShadow>{children}</ScrollShadow>
      <Link
        to="/app/library"
        className="text-muted-foreground hover:text-foreground flex shrink-0 items-center justify-center gap-1.5 text-sm font-medium transition-colors"
      >
        View library
        <ArrowRight className="size-4" />
      </Link>
    </section>
  )
}
