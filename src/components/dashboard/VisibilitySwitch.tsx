import { Switch } from "@/components/ui/switch"

type Props = {
  revealed: boolean
  name: string
  onChange: (revealed: boolean) => void
  // Hides the word on phones, where the switch alone has to do.
  compact?: boolean
}

// One switch for hidden (GM only) and revealed (every player). The label has
// a fixed width so the switch does not shift when the word changes.
export function VisibilitySwitch({ revealed, name, onChange, compact }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={revealed}
        onCheckedChange={onChange}
        aria-label={`${name} is ${revealed ? "revealed" : "hidden"}`}
      />
      <span className={`text-muted-foreground w-16 text-sm ${compact ? "max-md:hidden" : ""}`}>
        {revealed ? "Revealed" : "Hidden"}
      </span>
    </div>
  )
}
