import { Icon } from "lucide-react"
import type { LucideProps } from "lucide-react"

// The badge's lines are heavier than the lasso's, and a gap round them is cut out of the
// lasso (with a mask, so that it is the ground's colour whatever the ground is).
const BADGE_STROKE = 3
const GAP = 1.6

type Props = LucideProps & { id: string; badge: string }

// Lucide has no lasso with a plus or a minus, so each is the lasso, drawn as lucide draws
// it, with a badge about half as big as the icon at its lower right. It is lucide's own
// icon element, so size, colour and class work as for any of its icons.
function LassoBadge({ id, badge, ...props }: Props) {
  return (
    <Icon iconNode={[]} {...props}>
      <mask key="gap" id={id} maskUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#fff" stroke="none" />
        <path d={badge} stroke="#000" strokeWidth={BADGE_STROKE + GAP * 2} />
      </mask>
      <g key="lasso" mask={`url(#${id})`}>
        <path d="M3.704 14.467a10 8 0 1 1 3.115 2.375" />
        <path d="M7 22a5 5 0 0 1-2-3.994" />
        <circle cx="5" cy="16" r="2" />
      </g>
      <path key="badge" d={badge} strokeWidth={BADGE_STROKE} />
    </Icon>
  )
}

const PLUS = "M12.5 17.5h10M17.5 12.5v10"
const MINUS = "M12.5 17.5h10"

// The lasso as it is now: adding land with a plus, or cutting it away with a minus.
export function LassoIcon({ cutting, ...props }: LucideProps & { cutting: boolean }) {
  return <LassoBadge id={cutting ? "lasso-minus-gap" : "lasso-plus-gap"} badge={cutting ? MINUS : PLUS} {...props} />
}
