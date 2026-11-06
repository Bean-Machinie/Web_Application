import { Input } from "@/components/ui/input"
import { abilityShort } from "@/lib/character-format"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { StatBlock } from "@/lib/stat-block-types"
import { StatField } from "./StatField"

type Props = { abilities: StatBlock["abilities"]; onChange: (abilities: StatBlock["abilities"]) => void }

// The six scores. The modifier follows the score, and the save moves with it, so a creature
// that is proficient stays proficient.
export function StatBlockAbilitiesForm({ abilities, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {ABILITIES.map(([id]) => (
        <StatField key={id} label={abilityShort(id)}>
          <Input
            type="number"
            min={1}
            max={30}
            value={abilities[id].score}
            onChange={(event) => {
              const score = Number(event.target.value)
              if (!Number.isFinite(score)) return
              const old = abilities[id]
              const mod = Math.floor((score - 10) / 2)
              onChange({ ...abilities, [id]: { score, mod, save: old.save + mod - old.mod } })
            }}
          />
        </StatField>
      ))}
    </div>
  )
}
