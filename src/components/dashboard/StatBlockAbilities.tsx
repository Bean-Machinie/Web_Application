import { abilityShort, signed } from "@/lib/character-format"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityScore, StatBlock } from "@/lib/stat-block-types"

const ROWS: [label: string, read: (ability: AbilityScore) => string][] = [
  ["Score", (ability) => String(ability.score)],
  ["MOD", (ability) => signed(ability.mod)],
  ["SAVE", (ability) => signed(ability.save)],
]

// The six abilities side by side with score, modifier and saving throw under each. A save that
// differs from the modifier (the creature is proficient) is in stronger type.
export function StatBlockAbilities({ abilities }: { abilities: StatBlock["abilities"] }) {
  return (
    <div className="bg-card overflow-hidden rounded-lg border shadow-xs">
      <table className="w-full text-center tabular-nums">
        <thead>
          <tr className="text-muted-foreground border-b text-xs">
            <th className="w-14 py-1.5" />
            {ABILITIES.map(([id]) => (
              <th key={id} className="py-1.5 font-semibold">
                {abilityShort(id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([label, read]) => (
            <tr key={label} className="border-b last:border-b-0">
              <th className="text-muted-foreground py-1.5 pl-3 text-left text-xs font-medium">{label}</th>
              {ABILITIES.map(([id]) => {
                const ability = abilities[id]
                const proficient = label === "SAVE" && ability.save !== ability.mod
                return (
                  <td key={id} className={proficient ? "py-1.5 font-semibold" : "py-1.5"}>
                    {read(ability)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
