import { Input } from "@/components/ui/input"

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  // Only when this value is itself wrong.
  invalid: boolean
}

// A whole number of pixels: only digits can be typed. Its label is in the grid beside it.
export function MapSizeInput({ id, value, onChange, invalid }: Props) {
  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        maxLength={5}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        className="h-9 pr-8 tabular-nums"
      />
      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm">
        px
      </span>
    </div>
  )
}
