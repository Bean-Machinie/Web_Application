import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { SegmentedControl } from "@/components/ui/segmented-control"
import type { RecentBy } from "@/lib/world-recent"

type Props = {
  by: RecentBy
  onBy: (by: RecentBy) => void
  // The rows, or their skeleton.
  children: ReactNode
}

// The frame of the recent list: a card like the campaign cards, with the heading and the
// Edited / Created switch on top and the way to the library at the foot. The frame never
// changes while the rows inside it do.
export function RecentCard({ by, onBy, children }: Props) {
  return (
    <section className="bg-card flex flex-col rounded-lg border">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
        <h2 className="text-xl font-semibold tracking-tight">Recent</h2>
        <SegmentedControl<RecentBy>
          aria-label="Sort recent"
          value={by}
          onValueChange={onBy}
          options={[
            { value: "updated", label: "Edited" },
            { value: "created", label: "Created" },
          ]}
        />
      </div>
      <div className="flex flex-col px-2 pb-2">{children}</div>
      <Link
        to="/app/library"
        className="text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center justify-center gap-1.5 rounded-b-lg border-t py-3 text-sm font-medium transition-colors"
      >
        View library
        <ArrowRight className="size-4" />
      </Link>
    </section>
  )
}
