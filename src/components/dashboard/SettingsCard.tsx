import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = { children: ReactNode; flush?: boolean }

// Settings rows on the surface of the window, set apart by hairline dividers. Flush leaves off
// the lines above the first row and below the last, for a tab that runs straight on from the edges.
export function SettingsCard({ children, flush }: Props) {
  return <div className={cn("divide-y", !flush && "border-y")}>{children}</div>
}
