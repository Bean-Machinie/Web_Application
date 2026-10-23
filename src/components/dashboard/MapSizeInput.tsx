import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  invalid: boolean
}

// A whole number of pixels: only digits can be typed.
export function MapSizeInput({ id, label, value, onChange, invalid }: Props) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          maxLength={5}
          value={value}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
          className="pr-8 tabular-nums"
        />
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm">
          px
        </span>
      </div>
    </div>
  )
}
