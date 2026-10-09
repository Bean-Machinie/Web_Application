import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { StatAction } from "@/lib/stat-block"

type Props = {
  action: StatAction
  onChange: (change: Partial<StatAction>) => void
  onRemove: () => void
}

// Press and hold anywhere outside the inputs to drag the row.
export function StatActionRow({ action, onChange, onRemove }: Props) {
  return (
    <>
      <GripVertical className="text-muted-foreground size-4 shrink-0 cursor-grab" aria-hidden />
      <Input
        aria-label="Action name"
        autoComplete="off"
        maxLength={40}
        placeholder="Name, e.g. Bite"
        className="w-32 shrink-0 font-medium sm:w-44"
        value={action.name}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <Input
        aria-label={`${action.name || "Action"} details`}
        autoComplete="off"
        maxLength={120}
        placeholder="e.g. +4 to hit, 2d4+2 piercing"
        value={action.text}
        onChange={(event) => onChange({ text: event.target.value })}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground shrink-0"
        aria-label={`Remove ${action.name || "action"}`}
        onClick={onRemove}
      >
        <X />
      </Button>
    </>
  )
}
