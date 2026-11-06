import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// A form input with its small label above.
export function StatField({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("text-muted-foreground grid gap-1 text-xs font-medium", className)}>
      {label}
      {children}
    </label>
  )
}
