import type { CardModel } from "@/lib/quick-card"
import { has, NONE } from "@/lib/quick-card-format"
import { QuickSectionHeader } from "./QuickSectionHeader"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// The kits chosen for the class and the background, what is in the inventory, the gold, and the
// attacks with their to-hit and damage.
export function QuickGearTab({ shown, base, onPick }: Props) {
  const { kits, inventory, gold, attacks } = shown.gear
  const before = base.gear

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Equipment" className="flex flex-col gap-1">
        <QuickSectionHeader title="Equipment" onEdit={onPick ? () => onPick("equipment") : null} />
        {kits.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="flex flex-col gap-0.5">
          {kits.map((kit) => (
            <li key={kit} className="text-sm"><QuickValue value={kit} changed={!before.kits.includes(kit)} className="-ml-1" /></li>
          ))}
        </ul>
      </section>
      <section aria-label="Inventory" className="flex flex-col gap-1">
        <QuickSectionHeader title="Inventory" />
        {inventory.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="flex flex-col gap-0.5">
          {inventory.map((item, index) => (
            <li key={`${item}${index}`} className="text-sm"><QuickValue value={item} changed={!before.inventory.includes(item)} className="-ml-1" /></li>
          ))}
        </ul>
      </section>
      <section aria-label="Gold" className="flex flex-col gap-1">
        <QuickSectionHeader title="Gold" />
        <p className="text-sm"><QuickValue value={gold} changed={gold !== before.gold} className="-ml-1" /></p>
      </section>
      <section aria-label="Attacks" className="flex flex-col gap-1">
        <QuickSectionHeader title="Attacks" />
        {attacks.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="flex flex-col gap-1">
          {attacks.map((attack, index) => (
            <li key={`${attack.name}${index}`} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate">{attack.name}</span>
              <span className="text-muted-foreground flex shrink-0 items-baseline gap-2 text-xs">
                <QuickValue value={attack.hit} changed={!has(before.attacks, attack)} />
                <QuickValue value={attack.damage} changed={!has(before.attacks, attack)} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
