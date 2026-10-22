import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Props = {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

// One on/off setting: its name beside a switch.
export function GraphSwitchRow({ id, label, checked, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={id} className="text-xs font-normal">
        {label}
      </Label>
      <Switch id={id} size="sm" checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
