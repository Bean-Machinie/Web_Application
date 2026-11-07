import { Link } from "react-router-dom"
import { TiltCard } from "@/components/TiltCard"
import { entityCardSkin } from "@/components/tilt-card-styles"
import { Badge } from "@/components/ui/badge"
import { categoryTitle } from "@/lib/rules-terms"
import type { RuleEntry } from "@/lib/srd-rules-types"

import { ActionContextMenu } from "./ActionContextMenu"
import { openInNewTab } from "./openInNewTab"
import { useEntryPanel } from "./useEntryPanel"

type Props = { entry: RuleEntry; to: string; highlighted: boolean; showTag: boolean }

// A rules term as a card: the title with its tag, and the first two lines of its summary.
export function SrdRuleCard({ entry, to, highlighted, showTag }: Props) {
  const { openNew } = useEntryPanel()

  return (
    <ActionContextMenu actions={openInNewTab(openNew, entry.id)}>
    <div className="h-full">
    <TiltCard className={`group ${entityCardSkin(highlighted)}`}>
      <div className="flex h-full flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          {/* The stretched link makes the whole card clickable. */}
          <Link to={to} className="font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:rounded-lg focus-visible:after:ring-2">
            {entry.title}
          </Link>
          {showTag && (
            <Badge variant="secondary" className="text-muted-foreground shrink-0 rounded-md">
              {entry.tag ?? categoryTitle(entry.category)}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">{entry.summary}</p>
      </div>
    </TiltCard>
    </div>
    </ActionContextMenu>
  )
}
