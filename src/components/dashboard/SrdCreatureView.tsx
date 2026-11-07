import type { Monster } from "@/lib/compendium-monsters"
import { AddMonsterButton } from "./AddMonsterButton"
import { KindLabel } from "./KindLabel"
import { SrdCreatureBody } from "./SrdCreatureBody"

// An SRD creature on a page of its own, laid out like a library Creature's page but only to read.
export function SrdCreatureView({ monster }: { monster: Monster }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        <KindLabel kind="creature" />
        <AddMonsterButton monster={monster} />
      </div>
      <SrdCreatureBody monster={monster} />
    </div>
  )
}
