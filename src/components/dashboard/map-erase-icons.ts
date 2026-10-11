import { Eraser, RouteOff, TreePine } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { EraseTarget } from "@/lib/erase"

// The icon of each thing the eraser takes away, for its row and, as the sub tool in use,
// for the tool in the strip.
export const ERASE_ICONS: Record<EraseTarget, LucideIcon> = {
  biomes: Eraser,
  details: RouteOff,
  assets: TreePine,
}
