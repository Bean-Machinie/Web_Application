import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { BookOpenIcon } from "./BookOpenIcon"
import { BoxIcon } from "./BoxIcon"
import { MapIcon } from "./MapIcon"
import { PawPrintIcon } from "./PawPrintIcon"
import { PinIcon } from "./PinIcon"
import { UserStarIcon } from "./UserStarIcon"

// The icons in the "new entry" menus. Everywhere else a kind keeps the icon in WORLD_KINDS.
export const KIND_MENU_ICONS: Record<WorldEntryKind, AnimatedIconComponent> = {
  npc: UserStarIcon,
  creature: PawPrintIcon,
  location: PinIcon,
  item: BoxIcon,
  lore: BookOpenIcon,
  map: MapIcon,
}
