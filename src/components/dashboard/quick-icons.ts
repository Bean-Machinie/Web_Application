import { Crosshair, Languages, Ruler, ScrollText, Sparkles, Swords, Users } from "lucide-react"
import type { SlotKind } from "@/lib/quick-slots"

// The icon of each slot, for an option or a character with no picture.
export const SLOT_ICONS = {
  class: Swords,
  species: Users,
  background: ScrollText,
  approach: Crosshair,
  lineage: Sparkles,
  size: Ruler,
  language: Languages,
} satisfies Record<SlotKind, unknown>
