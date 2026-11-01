import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// How far the control reaches in its column. Every control starts at the same left edge.
const WIDTHS = { auto: "", field: "sm:max-w-xs", wide: "sm:max-w-sm" }

type Props = {
  title: string
  // One short line.
  description?: string
  width?: keyof typeof WIDTHS
  // A single-line control: the label is centred on it, not set to the top.
  center?: boolean
  children: ReactNode
}

// A label column and a control column. Stacked on a narrow screen.
export function SettingsRow({ title, description, width = "auto", center, children }: Props) {
  return (
    <div className={cn("grid gap-2 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8", center ? "sm:items-center" : "sm:items-start")}>
      <div className={cn("min-w-0", !center && "sm:pt-1.5")}>
        <h4 className="text-sm font-medium">{title}</h4>
        {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
      </div>
      <div className={cn("min-w-0", WIDTHS[width])}>{children}</div>
    </div>
  )
}

// Small muted text directly under a control.
export function SettingsHelp({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground mt-2 text-xs">{children}</p>
}
