import { Bug, Droplet, Eye, Flame, Ghost, Leaf, Mountain, PawPrint, Skull, Sparkles, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { monsterById } from "./compendium-monsters"
import type { Monster } from "./compendium-monsters"
import type { WorldEntry } from "./world-entries"

// Library entries have database ids; an SRD creature is given one that cannot be mistaken for them.
const PREFIX = "srd:"

export const isSrdEntryId = (id: string) => id.startsWith(PREFIX)

// A monster in the shape of a library Creature, so the cards, the search and the picking that
// serve entries serve it too.
export function srdEntry(monster: Monster): WorldEntry {
  return {
    id: PREFIX + monster.id,
    kind: "creature",
    name: monster.name,
    revealed: true,
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
    imageUrl: null,
    imagePath: null,
    role: null,
    status: null,
  }
}

export const srdMonster = (entry: WorldEntry) => monsterById(isSrdEntryId(entry.id) ? entry.id.slice(PREFIX.length) : undefined)

export const monsterSubtitle = ({ statBlock }: Monster) => `CR ${statBlock.cr.value} · ${statBlock.type}`

const TYPE_ICONS: Record<string, LucideIcon> = {
  Aberration: Eye,
  Beast: PawPrint,
  Celestial: Sparkles,
  Construct: Bug,
  Dragon: Flame,
  Elemental: Flame,
  Fey: Sparkles,
  Fiend: Flame,
  Giant: Mountain,
  Humanoid: User,
  Monstrosity: Bug,
  Ooze: Droplet,
  Plant: Leaf,
  Undead: Ghost,
}

// What stands in for a picture: the creature's type.
export const monsterIcon = ({ statBlock }: Monster): LucideIcon => TYPE_ICONS[statBlock.type] ?? Skull
