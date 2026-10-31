import { Switch } from "@/components/ui/switch"
import { EditedMarker } from "./EditedMarker"

type Props = {
  label: string
  on: boolean
  edited: boolean
  // What the calculation gives, for the reset button's tooltip.
  calculated: string | null
  onChange: (on: boolean) => void
  onReset: () => void
}

// A toggle that starts out as the sheet works it out (a saving throw the class gives).
export function CharacterDerivedToggle({ label, on, edited, calculated, onChange, onReset }: Props) {
  return (
    <span className="flex items-center gap-1.5">
      <Switch size="sm" checked={on} onCheckedChange={onChange} aria-label={label} />
      {edited && <EditedMarker calculated={calculated} onReset={onReset} />}
    </span>
  )
}
