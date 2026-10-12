import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  description?: string
  // Wide controls (inputs, text areas) get the full width below the label on narrow screens
  // and a fixed column beside it on wide ones.
  wide?: boolean
  children: ReactNode
}

export function SettingsRow({ title, description, wide, children }: Props) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-5">
      <div className="min-w-0 sm:max-w-[16rem] sm:pt-1.5">
        <h4 className="text-sm font-medium">{title}</h4>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </div>
      <div className={cn("min-w-0", wide ? "sm:w-72" : "sm:shrink-0")}>{children}</div>
    </div>
  )
}
