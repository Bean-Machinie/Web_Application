import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { reasonsFor } from "@/lib/world-copy-plan"
import type { Plan, PlanNode, Reach } from "@/lib/world-copy-plan"
import { KindLabel } from "./KindLabel"

type Props = {
  plan: Plan
  reach: Reach
  unticked: ReadonlySet<string>
  onToggle: (entryId: string) => void
}

const SHOWN_NAMES = 2

// "X, Y and 2 more".
function names(list: string[]) {
  const shown = list.slice(0, SHOWN_NAMES).join(", ")
  return list.length > SHOWN_NAMES ? `${shown} and ${list.length - SHOWN_NAMES} more` : shown
}

function Reason({ plan, node, reach }: { plan: Plan; node: PlanNode; reach: Reach }) {
  const { pinnedOn, mentionedIn } = reasonsFor(plan, node.sourceId, reach)
  const parts = [
    pinnedOn.length > 0 && `Pinned on ${names(pinnedOn)}`,
    mentionedIn.length > 0 && `Mentioned in ${names(mentionedIn)}`,
  ].filter(Boolean)

  return (
    <span className="text-muted-foreground truncate text-xs">
      {parts.length > 0 ? parts.join(" · ") : "Only linked through entries you left out"}
    </span>
  )
}

// The entries the copy links to. A new one has a checkbox, ticked unless it was
// left out; one the target already has is marked, and links to it are kept. An
// entry reached only through ones that were left out cannot be ticked, and
// comes back when one of those is.
export function CopyPlanList({ plan, reach, unticked, onToggle }: Props) {
  const shown = plan.nodes.filter(
    (node) => !node.isRoot && (!node.existingId || reach.present.has(node.sourceId))
  )

  return (
    <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
      {shown.map((node) => {
        const isNew = !node.existingId
        const unreachable = isNew && !reach.included.has(node.sourceId) && !unticked.has(node.sourceId)
        const ticked = reach.included.has(node.sourceId)

        return (
          <li
            key={node.sourceId}
            className={cn("flex items-center gap-3 px-3 py-2", unreachable && "opacity-60")}
          >
            {isNew && (
              <Checkbox
                checked={ticked}
                disabled={unreachable}
                aria-label={`Bring ${node.name}`}
                onCheckedChange={() => onToggle(node.sourceId)}
              />
            )}
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="truncate text-sm">{node.name}</span>
              <KindLabel kind={node.kind} />
              <Reason plan={plan} node={node} reach={reach} />
            </span>
            {!isNew && <Badge variant="outline">Already here</Badge>}
          </li>
        )
      })}
    </ul>
  )
}
