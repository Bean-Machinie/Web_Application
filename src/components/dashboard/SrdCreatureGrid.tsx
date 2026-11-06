import type { CardSize } from "@/hooks/use-world-card-size"
import type { Monster } from "@/lib/compendium-monsters"
import { monsterIcon, monsterSubtitle, srdEntry } from "@/lib/srd-entries"
import { monsterPath } from "@/lib/srd-paths"
import { WorldEntryCard } from "./WorldEntryCard"
import { gridStyle } from "./world-grid-style"

type Props = { monsters: Monster[]; size: CardSize }

// The SRD creatures as the library's cards, with their type icon for a picture. Nothing on a card
// can be changed, so it has no menu and cannot be picked.
export function SrdCreatureGrid({ monsters, size }: Props) {
  if (monsters.length === 0) return <p className="text-muted-foreground px-2 py-10 text-center text-sm">No creature matches.</p>

  return (
    <div style={gridStyle(size)} className="grid gap-4">
      {monsters.map((monster) => (
        <WorldEntryCard
          key={monster.id}
          entry={srdEntry(monster)}
          manage={null}
          selection={null}
          to={monsterPath(monster.id)}
          subtitle={monsterSubtitle(monster)}
          icon={monsterIcon(monster)}
        />
      ))}
    </div>
  )
}
