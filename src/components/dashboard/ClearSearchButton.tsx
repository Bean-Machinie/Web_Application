import { X } from "lucide-react"
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"

type Props = { value: string; onClear: () => void }

// The x at the end of a search box: empties it and keeps the cursor there. It is
// only there while there is something to clear.
export function ClearSearchButton({ value, onClear }: Props) {
  if (!value) return null

  return (
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        size="icon-xs"
        aria-label="Clear search"
        onClick={(event) => {
          onClear()
          event.currentTarget.closest("[data-slot=input-group]")?.querySelector("input")?.focus()
        }}
      >
        <X />
      </InputGroupButton>
    </InputGroupAddon>
  )
}
