import { Badge } from "@/components/ui/badge"
import type { Kit } from "@/lib/character-templates/srd-5-2-1-choices"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  kits: Kit[]
  selected: string | null
  // Armor Class each kit gives, where it can be worked out.
  armorClass: (kit: Kit) => number | null
  onSelect: (kit: Kit) => void
}

// The equipment options of a class or a background: each a card with its items, and the Armor
// Class it gives. Exactly one is chosen, and none is chosen for the player.
export function BuilderKitCard({ title, kits, selected, armorClass, onSelect }: Props) {
  return (
    <section aria-label={title} className="bg-card rounded-lg border p-5 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-muted-foreground text-xs">Choose one</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {kits.map((kit) => {
          const ac = kit.items.length > 0 ? armorClass(kit) : null
          return (
            <button
              key={kit.id}
              type="button"
              aria-pressed={kit.id === selected}
              onClick={() => onSelect(kit)}
              className={cn(
                "focus-visible:ring-ring flex min-w-0 flex-[1_1_220px] flex-col gap-2 rounded-lg border p-4 text-left outline-none focus-visible:ring-2",
                kit.id === selected ? "border-foreground bg-accent" : "hover:bg-accent/50"
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold">{kit.label === "Gold" ? "Gold" : `Kit ${kit.label}`}</span>
                {ac !== null && <Badge variant="secondary">AC {ac}</Badge>}
              </span>
              {kit.items.length > 0 ? (
                <ul className="text-muted-foreground list-disc pl-4 text-sm">
                  {kit.items.map((item, index) => (
                    <li key={index}>{item.qty && item.qty > 1 ? `${item.qty} × ${item.name}` : item.name}</li>
                  ))}
                  <li>{kit.gp} GP</li>
                </ul>
              ) : (
                <span className="text-muted-foreground text-sm">{kit.gp} GP to buy your own gear</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
