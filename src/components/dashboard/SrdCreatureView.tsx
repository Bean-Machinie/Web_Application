import { monsterIcon, monsterSubtitle } from "@/lib/srd-entries"
import type { Monster } from "@/lib/compendium-monsters"
import { SRD_LABEL } from "@/lib/srd-paths"
import { AddMonsterButton } from "./AddMonsterButton"
import { KindLabel } from "./KindLabel"
import { StatBlock } from "./StatBlock"

// An SRD creature laid out like a library Creature's page, but only to read: the type icon where
// the picture goes, the stat block, and the way to add it to a campaign.
export function SrdCreatureView({ monster }: { monster: Monster }) {
  const Icon = monsterIcon(monster)

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-2xl font-semibold tracking-tight break-words">{monster.name}</h2>
        <div className="flex shrink-0 items-center gap-3 pt-1.5">
          <KindLabel kind="creature" />
          <AddMonsterButton monster={monster} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center rounded-lg border">
          <Icon className="size-16" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium">{monsterSubtitle(monster)}</p>
          <p className="text-muted-foreground text-sm">{SRD_LABEL}, read only.</p>
        </div>
      </div>
      <StatBlock block={monster.statBlock} source={monster.source} />
    </div>
  )
}
