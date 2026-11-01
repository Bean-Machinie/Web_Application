import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { SectionLabel } from "./SectionLabel"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { RecentBy } from "@/lib/world-recent"

type Props = {
  // "Recent" unless said otherwise.
  title?: string
  // The Edited / Created switch; without them there is none.
  by?: RecentBy
  onBy?: (by: RecentBy) => void
  // The rows, or their skeleton.
  children: ReactNode
}

// The frame of the recent list: a card like the campaign cards, with the heading and the
// Edited / Created switch on top and the way to the library at the foot. The frame never
// changes while the rows inside it do: it takes the height of the column it is in, however
// many rows there are, and the rows scroll. The Create page's drafts use it without the switch.
export function RecentCard({ title = "Recent", by, onBy, children }: Props) {
  return (
    <section className="flex max-h-[480px] flex-col lg:absolute lg:inset-0 lg:max-h-none">
      <SectionLabel
        action={
          by &&
          onBy && (
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
          )
        }
      >
        {title}
      </SectionLabel>
      <div className="bg-card flex min-h-0 flex-1 flex-col rounded-lg border">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">{children}</div>
        <Link
          to="/app/library"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex shrink-0 items-center justify-center gap-1.5 rounded-b-lg border-t py-3 text-sm font-medium transition-colors"
        >
          View library
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
