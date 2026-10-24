import { HoverIcon } from "@/components/icons/HoverIcon"
import { LockIcon } from "@/components/icons/LockIcon"
import { LockOpenIcon } from "@/components/icons/LockOpenIcon"
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
  const Icon = isPrivate ? LockIcon : LockOpenIcon
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
      <HoverIcon icon={Icon} />
    </Button>
  )
}
