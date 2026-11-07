import type { CardSize } from "@/hooks/use-world-card-size"
import { ToolbarToggle } from "./ToolbarToggle"

type Props = { value: CardSize; onChange: (size: CardSize) => void }

const SIZES = [
  { value: "small", content: "S", label: "Small cards" },
  { value: "medium", content: "M", label: "Medium cards" },
  { value: "large", content: "L", label: "Large cards" },
] as const

export function CardSizeControl({ value, onChange }: Props) {
  return <ToolbarToggle value={value} onChange={onChange} label="Card size" options={SIZES.map((size) => ({ ...size }))} />
}
