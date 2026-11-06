import { monsterIcon, monsterSubtitle } from "@/lib/srd-entries"
import type { Monster } from "@/lib/compendium-monsters"
import { SRD_LABEL } from "@/lib/srd-paths"
import { StatBlock } from "./StatBlock"

// What an SRD creature shows besides its name, to read: the type icon where a picture would be,
// the line under it, and the stat block. In the library's panel and on the creature's own page.
export function SrdCreatureBody({ monster }: { monster: Monster }) {
  const Icon = monsterIcon(monster)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-muted text-muted-foreground flex size-16 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-8" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-lg font-medium">{monsterSubtitle(monster)}</p>
          <p className="text-muted-foreground text-sm">{SRD_LABEL}, read only.</p>
        </div>
      </div>
      <StatBlock block={monster.statBlock} source={monster.source} />
    </div>
  )
}
