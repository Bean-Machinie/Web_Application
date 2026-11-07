import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

// The row at the top of every panel in the library and the journal: the tree's, the toolbar over
// the cards, the detail panel's and a pane's tab strip, all the same height with a line under.
export function PanelHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("bg-muted/50 dark:bg-sidebar flex h-9 shrink-0 items-center gap-1 border-b px-1.5", className)} {...props} />
}
