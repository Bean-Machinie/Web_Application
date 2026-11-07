import { Link } from "react-router-dom"
import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  icon: AnimatedIconComponent
  // A link, or a button when there is only onClick.
  to?: string
  onClick?: () => void
  className?: string
}

const TILE =
  "text-muted-foreground hover:text-foreground hover:border-border-strong hover:bg-accent/40 focus-visible:ring-ring flex shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2"

// The dashed tile at the end of a row on Home: make or join one more.
export function HomeAddCard({ label, icon, to, onClick, className }: Props) {
  const body = (
    <>
      <HoverIcon icon={icon} size={20} />
      {label}
    </>
  )

  return to ? (
    <Link to={to} className={cn(TILE, className)}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cn(TILE, className)}>
      {body}
    </button>
  )
}
