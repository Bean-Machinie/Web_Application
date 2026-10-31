import { Backpack, Coins, Package, Swords } from "lucide-react"
import { Accordion } from "@/components/ui/accordion"
import type { CardModel } from "@/lib/quick-card"
import { has, NONE } from "@/lib/quick-card-format"
import { QuickChangeRow } from "./QuickChangeRow"
import { QuickSection } from "./QuickSection"
import { QuickValue } from "./QuickValue"

type Props = { shown: CardModel; base: CardModel; onPick: ((pick: string) => void) | null }

// The kits chosen for the class and the background as accordion rows, what is in the inventory,
// the gold, and the attacks with their to-hit and damage.
export function QuickGearTab({ shown, base, onPick }: Props) {
  const { kits, inventory, gold, attacks } = shown.gear
  const before = base.gear
  const equipment = onPick ? () => onPick("equipment") : null

  return (
    <Accordion type="single" collapsible>
      <QuickSection icon={Backpack} title="Equipment" subtitle="Class and background kits" onOpen={equipment}>
        {kits.length === 0 && <p className="text-sm">{NONE}</p>}
        <div className="flex flex-col">
          {kits.map((kit) => (
            <QuickChangeRow key={kit.source} value={kit.source} name={kit.source} text={kit.choice} suggested={kit.suggested} changed={!has(before.kits, kit)} about="The starting equipment you took; its items are in your inventory." onChange={equipment} />
          ))}
        </div>
      </QuickSection>
      <QuickSection icon={Package} title="Inventory" subtitle={`${inventory.length} ${inventory.length === 1 ? "item" : "items"}`}>
        {inventory.length === 0 && <p className="text-sm">{NONE}</p>}
        <ul className="flex flex-col gap-0.5">
          {inventory.map((item, index) => (
            <li key={`${item}${index}`} className="text-sm"><QuickValue value={item} changed={!before.inventory.includes(item)} className="-ml-1" /></li>
          ))}
        </ul>
      </QuickSection>
      <QuickSection icon={Coins} title="Gold" subtitle={gold} />
      <QuickSection icon={Swords} title="Attacks" subtitle={`${attacks.length} ${attacks.length === 1 ? "attack" : "attacks"}`}>
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
    </Accordion>
  )
}
