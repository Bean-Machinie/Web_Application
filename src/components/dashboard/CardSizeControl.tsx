import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { CardSize } from "@/hooks/use-world-card-size"

type Props = { value: CardSize; onChange: (size: CardSize) => void }

const SIZES: { size: CardSize; short: string; label: string }[] = [
  { size: "small", short: "S", label: "Small cards" },
  { size: "medium", short: "M", label: "Medium cards" },
  { size: "large", short: "L", label: "Large cards" },
]

// Marked by what the group sets on the chosen item, as the view toggle next to it is.
const CHOSEN = "aria-checked:bg-muted"

// How big the cards of the grid are. It looks like the list, grid and graph toggle beside it.
export function CardSizeControl({ value, onChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      // Pressing the chosen size again would clear the group; keep it chosen.
      onValueChange={(next) => next && onChange(next as CardSize)}
      aria-label="Card size"
      spacing={0}
    >
      {SIZES.map(({ size, short, label }) => (
        <ToggleGroupItem key={size} value={size} aria-label={label} className={CHOSEN}>
          {short}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
