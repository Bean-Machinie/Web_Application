import { useState } from "react"
import { Input } from "@/components/ui/input"

type Props = {
  label: string
  value: number | undefined
  placeholder?: string
  disabled?: boolean
  // Every valid number typed; the parent clamps it.
  onChange: (value: number | undefined) => void
}

const noSpinner =
  "text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

// Holds what is being typed until the field is left, so clearing it to type
// a new number does not snap back to the old one.
export function HealthInput({ label, value, placeholder = "—", disabled, onChange }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <Input
      aria-label={label}
      type="number"
      inputMode="numeric"
      min={0}
      autoComplete="off"
      disabled={disabled}
      placeholder={placeholder}
      className={noSpinner}
      value={draft ?? value?.toString() ?? ""}
      onChange={(event) => {
        setDraft(event.target.value)
        const number = Number(event.target.value)
        if (event.target.value.trim() !== "" && Number.isFinite(number)) onChange(Math.trunc(number))
      }}
      onBlur={() => {
        if (draft === "") onChange(undefined)
        setDraft(null)
      }}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
    />
  )
}
