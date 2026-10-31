import type { CardModel } from "@/lib/quick-card"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel }

// Hit Points, Armor Class and Speed as one row of large numbers, then the six abilities
// as tiles like the sheet's: the modifier large, the score small. What differs from the
// committed card `base` is highlighted. Shown beside a pick, in its panel.
export function QuickCardNumbers({ shown, base }: Props) {
  const big = [
    { label: "Hit Points", value: shown.hp, changed: shown.hp !== base.hp },
    { label: "Armor Class", value: shown.ac, changed: shown.ac !== base.ac },
    { label: "Speed", value: shown.speed, changed: shown.speed !== base.speed },
  ]

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 divide-x rounded-lg border py-2">
        {big.map(({ label, value, changed }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <dd className="text-2xl font-semibold"><QuickValue value={value} changed={changed} /></dd>
            <dt className="text-muted-foreground text-[11px]">{label}</dt>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-1">
        <ul aria-label="Ability scores" className="grid grid-cols-3 gap-2 max-[999px]:grid-cols-6">
          {shown.mods.map((mod, index) => (
            <li key={mod.id} className="bg-muted/40 flex flex-col items-center rounded-lg border py-1.5">
              <span className="text-muted-foreground text-[10px] font-medium">{mod.label}</span>
              <QuickValue value={mod.mod} changed={mod.mod !== base.mods[index].mod} className="text-xl font-semibold" />
              <QuickValue value={mod.score} changed={mod.score !== base.mods[index].score} className="text-muted-foreground text-xs" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
