import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// A solid panel inset in the page, like the journal's panes: the page's second grey, a 1px border
// and rounded corners, standing on the bottom of the window.
export function LibraryPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("bg-card h-full overflow-hidden rounded-t-lg border border-b-0 dark:bg-background", className)}>{children}</div>
}
