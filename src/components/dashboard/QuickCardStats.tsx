import type { CardModel } from "@/lib/quick-card"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel }

function Stat({ label, value, changed }: { label: string; value: string; changed: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="-ml-1 text-sm"><QuickValue value={value} changed={changed} /></dd>
    </div>
  )
}

// The numbers and picks of the card. `base` is the committed card; whatever `shown` (the
// previewed one) has differently is highlighted.
export function QuickCardStats({ shown, base }: Props) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <dl className="grid grid-cols-4 gap-x-2 gap-y-2 min-[1000px]:grid-cols-2">
        <Stat label="Hit Points" value={shown.hp} changed={shown.hp !== base.hp} />
        <Stat label="Armor Class" value={shown.ac} changed={shown.ac !== base.ac} />
        <Stat label="Speed" value={shown.speed} changed={shown.speed !== base.speed} />
        <Stat label="Darkvision" value={shown.darkvision} changed={shown.darkvision !== base.darkvision} />
      </dl>
      <ul aria-label="Ability modifiers" className="grid grid-cols-6 gap-1">
        {shown.mods.map((mod, index) => (
          <li key={mod.id} className="bg-muted/50 flex flex-col items-center rounded-md py-1">
            <span className="text-muted-foreground text-[10px] font-medium">{mod.label}</span>
            <QuickValue value={mod.value} changed={mod.value !== base.mods[index].value} className="text-sm" />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Origin feat</span>
          <span className="-ml-1 text-sm">
            <QuickValue value={shown.feat || "—"} changed={shown.feat !== base.feat} />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Skills</span>
          <ul className="flex flex-wrap gap-1">
            {shown.skills.length === 0 && <li className="text-sm">—</li>}
            {shown.skills.map((skill) => (
              <li key={skill} className="text-xs">
                <QuickValue value={skill} changed={!base.skills.includes(skill)} className="bg-muted/60" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
