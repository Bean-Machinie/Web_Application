import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const WIDTHS = { auto: "sm:shrink-0", field: "sm:w-72", wide: "sm:w-[22rem]" }

type Props = {
  title: string
  // One short line.
  description?: string
  // How wide the control is beside the label; stacked under it on a narrow screen.
  width?: keyof typeof WIDTHS
  children: ReactNode
}

export function SettingsRow({ title, description, width = "auto", children }: Props) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:py-6">
      <div className="min-w-0 sm:flex-1 sm:pt-1.5">
        <h4 className="text-sm font-medium">{title}</h4>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </div>
      <div className={cn("min-w-0", WIDTHS[width])}>{children}</div>
    </div>
  )
}

// Small muted text directly under a control.
export function SettingsHelp({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground mt-2 text-xs">{children}</p>
}
