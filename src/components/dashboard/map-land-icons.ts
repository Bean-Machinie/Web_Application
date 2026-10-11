import { createLucideIcon } from "lucide-react"
import type { IconNode, LucideIcon } from "lucide-react"
import type { LandMode } from "@/lib/map-builder-tools"

// The lasso's own paths, as lucide draws it.
const LASSO: IconNode = [
  ["path", { d: "M3.704 14.467a10 8 0 1 1 3.115 2.375", key: "loop" }],
  ["path", { d: "M7 22a5 5 0 0 1-2-3.994", key: "tail" }],
  ["circle", { cx: "5", cy: "16", r: "2", key: "knot" }],
]

// Lucide has no lasso with a plus or a minus, so each is the lasso with a small badge
// at its lower right, in lines of the same stroke as the lasso's.
const LassoPlus = createLucideIcon("lasso-plus", [
  ...LASSO,
  ["path", { d: "M20.5 19v4", key: "up" }],
  ["path", { d: "M18.5 21h4", key: "across" }],
])
const LassoMinus = createLucideIcon("lasso-minus", [...LASSO, ["path", { d: "M18.5 21h4", key: "across" }]])

// The lasso as it is now: adding land, or cutting it away.
export const LASSO_ICONS: Record<LandMode, LucideIcon> = { add: LassoPlus, cut: LassoMinus }
