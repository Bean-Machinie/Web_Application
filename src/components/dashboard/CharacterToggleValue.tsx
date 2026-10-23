import { Switch } from "@/components/ui/switch"

// On or off, flipped with a click.
export function CharacterToggleValue({ value, label, onChange }: { value: unknown; label: string; onChange: (value: boolean) => void }) {
  return <Switch size="sm" checked={value === true} onCheckedChange={onChange} aria-label={label} />
}
