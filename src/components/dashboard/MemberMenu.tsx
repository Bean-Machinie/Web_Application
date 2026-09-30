import { MoreHorizontal } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type MemberAction = {
  label: string
  icon?: LucideIcon
  destructive?: boolean
  onSelect: () => void
}

// The row menu. A new role action, like "Make co-GM", is one more entry in
// the list the table passes in.
export function MemberMenu({ name, actions }: { name: string; actions: MemberAction[] }) {
  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground size-8"
          aria-label={`Actions for ${name}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            className="cursor-pointer gap-2.5 px-2.5 py-2 whitespace-nowrap dark:data-[variant=destructive]:focus:bg-destructive/10"
            variant={action.destructive ? "destructive" : "default"}
            onSelect={action.onSelect}
          >
            {action.icon && <action.icon />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
