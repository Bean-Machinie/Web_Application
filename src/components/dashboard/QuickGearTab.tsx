import type { CardModel } from "@/lib/quick-card"
import { has, NONE } from "@/lib/quick-card-format"
import { Backpack } from "lucide-react"
import { useState } from "react"
import { QuickChangeRow } from "./QuickChangeRow"
import { QuickSection } from "./QuickSection"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// The kits chosen for the class and the background, what is in the inventory, the gold, and the
// attacks with their to-hit and damage.
export function QuickGearTab({ shown, base, onPick }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const { kits, inventory, gold, attacks } = shown.gear
  const before = base.gear

  return (
    <div className="flex flex-col">
      <QuickSection label="Equipment">
        {kits.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="-mx-2 flex flex-col">
          {kits.map((kit) => (
            <QuickChangeRow
              key={kit.source}
              icon={Backpack}
              name={kit.source}
              value={kit.choice}
              changed={!has(before.kits, kit)}
              open={open === kit.source}
              onToggle={() => setOpen(open === kit.source ? null : kit.source)}
              text="The starting equipment you took; its items are in your inventory."
              onChange={onPick ? () => onPick("equipment") : null}
            />
          ))}
        </ul>
      </QuickSection>
      <QuickSection label="Inventory">
        {inventory.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="flex flex-col gap-0.5">
          {inventory.map((item, index) => (
            <li key={`${item}${index}`} className="text-sm"><QuickValue value={item} changed={!before.inventory.includes(item)} className="-ml-1" /></li>
          ))}
        </ul>
      </QuickSection>
      <QuickSection label="Gold">
        <p className="text-sm"><QuickValue value={gold} changed={gold !== before.gold} className="-ml-1" /></p>
      </QuickSection>
      <QuickSection label="Attacks">
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
      </QuickSection>
    </div>
  )
}
