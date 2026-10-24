import { SegmentedControl } from "@/components/ui/segmented-control"
import type { CardSize } from "@/hooks/use-world-card-size"

type Props = { value: CardSize; onChange: (size: CardSize) => void }

// How big the cards of the grid are.
export function CardSizeControl({ value, onChange }: Props) {
  return (
    <SegmentedControl
      aria-label="Card size"
      // The Filter button's outline and corners, drawn as a ring so the height stays the same.
      className="rounded-md ring-1 ring-border ring-inset dark:ring-input"
      value={value}
      onValueChange={onChange}
      options={[
        { value: "small", label: "S" },
        { value: "medium", label: "M" },
        { value: "large", label: "L" },
      ]}
    />
  )
}
