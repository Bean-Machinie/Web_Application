import type { LucideIcon } from "lucide-react"
import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { EllipsisIcon } from "@/components/icons/EllipsisIcon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type MemberAction = {
  label: string
  icon?: AnimatedIconComponent | LucideIcon
  destructive?: boolean
  onSelect: () => void
}

// The row menu. A new role action, like "Make co-GM", is one more entry in
// the list the table passes in.
export function MemberMenu({ name, actions }: { name: string; actions: MemberAction[] }) {
  if (actions.length === 0) return null

  // Destructive actions go last, set apart by a line.
  const safe = actions.filter((action) => !action.destructive)
  const destructive = actions.filter((action) => action.destructive)

  const renderItem = (action: MemberAction) => (
    <DropdownMenuItem
      key={action.label}
      className="cursor-pointer gap-2.5 rounded-md px-2 py-1.5 whitespace-nowrap"
      variant={action.destructive ? "destructive" : "default"}
      onSelect={action.onSelect}
    >
      {action.icon && <HoverIcon icon={action.icon} className={action.destructive ? "" : "text-muted-foreground"} />}
      {action.label}
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-8"
          aria-label={`Actions for ${name}`}
        >
          <HoverIcon icon={EllipsisIcon} size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48 p-1 shadow-lg">
        {safe.map(renderItem)}
        {safe.length > 0 && destructive.length > 0 && <DropdownMenuSeparator className="my-1" />}
        {destructive.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
