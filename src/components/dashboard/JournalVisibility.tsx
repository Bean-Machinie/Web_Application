import { useId } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Props = { revealed: boolean; onChange: (revealed: boolean) => void }

// Pages are for the GM alone until this is on.
export function JournalVisibility({ revealed, onChange }: Props) {
  const id = useId()

  return (
    <div className="flex items-center gap-2">
      <Switch id={id} size="sm" checked={revealed} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-muted-foreground cursor-pointer text-xs font-medium">
        Visible to players
      </Label>
    </div>
  )
}
