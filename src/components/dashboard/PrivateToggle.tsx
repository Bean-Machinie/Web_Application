import { Lock, LockOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrivateToggle({
  label,
  isPrivate,
  onChange,
}: {
  label: string
  isPrivate: boolean
  onChange: (isPrivate: boolean) => void
}) {
  const Icon = isPrivate ? Lock : LockOpen
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={isPrivate ? "text-foreground" : "text-muted-foreground"}
      aria-pressed={isPrivate}
      aria-label={`${label} is ${isPrivate ? "private" : "visible to players"}`}
      title={isPrivate ? "Private: players see “Undisclosed”" : "Visible to players"}
      onClick={() => onChange(!isPrivate)}
    >
      <Icon />
    </Button>
  )
}
