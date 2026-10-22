import { SegmentedControl } from "@/components/ui/segmented-control"
import type { CardSize } from "@/hooks/use-world-card-size"

type Props = { value: CardSize; onChange: (size: CardSize) => void }

// How big the cards of the grid are.
export function CardSizeControl({ value, onChange }: Props) {
  return (
    <SegmentedControl
      aria-label="Card size"
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
