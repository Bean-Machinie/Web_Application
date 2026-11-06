import type { Monster } from "@/lib/compendium-monsters"
import { AddMonsterButton } from "./AddMonsterButton"
import { KindLabel } from "./KindLabel"
import { SrdCreatureBody } from "./SrdCreatureBody"

// An SRD creature on a page of its own, laid out like a library Creature's page but only to read.
export function SrdCreatureView({ monster }: { monster: Monster }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-2xl font-semibold tracking-tight break-words">{monster.name}</h2>
        <div className="flex shrink-0 items-center gap-3 pt-1.5">
          <KindLabel kind="creature" />
          <AddMonsterButton monster={monster} />
        </div>
      </div>
      <SrdCreatureBody monster={monster} />
    </div>
  )
}
