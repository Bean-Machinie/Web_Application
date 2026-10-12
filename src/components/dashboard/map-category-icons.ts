import { Building2, Castle, Cloud, Flame, Leaf, Mountain, MountainSnow, Shapes, Sun, Tent, TreePalm, TreePine, Trees } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { categoryKey } from "@/lib/map-assets"

// By the key of a category's folder (see categoryKey); a new folder gets the fallback.
const ICONS: Record<string, LucideIcon> = {
  buildings: Building2,
  camp: Tent,
  desert: Sun,
  "desert-trees": TreePalm,
  floating: Cloud,
  hills: Mountain,
  mountains: MountainSnow,
  nature: Leaf,
  "oak-trees": Trees,
  "pine-trees": TreePine,
  towns: Castle,
  volcanos: Flame,
}

export const categoryIcon = (category: string) => ICONS[categoryKey(category)] ?? Shapes
