import { Link } from "react-router-dom"
import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import { Badge } from "@/components/ui/badge"
import { categoryTitle } from "@/lib/rules-terms"
import type { RuleEntry } from "@/lib/srd-rules-types"

type Props = { entry: RuleEntry; to: string; highlighted: boolean }

// A rules term as a card: the title with its tag, and the first two lines of its summary.
export function SrdRuleCard({ entry, to, highlighted }: Props) {
  return (
    <TiltCard
      className={`group ${highlighted ? "bg-primary/10 border-primary ring-primary ring-2" : "bg-card"} rounded-lg border ${tiltCardSkin(highlighted ? "selected" : "default")}`}
    >
      <div className="flex h-full flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          {/* The stretched link makes the whole card clickable. */}
          <Link to={to} className="font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2">
            {entry.title}
          </Link>
          <Badge variant="secondary" className="text-muted-foreground shrink-0 rounded-md">
            {entry.tag ?? categoryTitle(entry.category)}
          </Badge>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">{entry.summary}</p>
      </div>
    </TiltCard>
  )
}
