import { Button } from "@/components/ui/button"

type Props = { sizeChoice: boolean; onPick: (pick: string) => void }

// The things on the character that have no word in the sentence, each opening its panel.
export function QuickCardEdits({ sizeChoice, onPick }: Props) {
  const items = [
    { key: "abilities", label: "Ability scores" },
    { key: "equipment", label: "Equipment" },
    { key: "origin-feat", label: "Origin feat" },
    ...(sizeChoice ? [{ key: "size", label: "Size" }] : []),
    { key: "details", label: "Details" },
  ]
  return (
    <section aria-label="Change" className="flex flex-wrap gap-1.5 border-t pt-3">
      {items.map((item) => (
        <Button key={item.key} variant="outline" size="sm" onClick={() => onPick(item.key)}>
          {item.label}
        </Button>
      ))}
    </section>
  )
}
