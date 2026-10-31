import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  icon: ReactNode
  // What the row is called, small and muted; without it the title is the name.
  eyebrow?: string | null
  // The pick (a pill), or the name itself.
  title: ReactNode
  // At most two lines, the whole of it in a tooltip.
  description?: string
  extras?: ReactNode
}

// A row of a QuickSection: a 20px icon with no box, in line with the first line of text, then the
// eyebrow, the title, a description and extras.
export function QuickItemRow({ icon, eyebrow, title, description, extras }: Props) {
  return (
    <li className="flex items-start gap-3">
      <span aria-hidden className="text-muted-foreground flex h-5 shrink-0 items-center [&_svg]:size-5 [&_svg]:stroke-[1.5]">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        {eyebrow && <p className="text-muted-foreground text-xs leading-5">{eyebrow}</p>}
        <div className={eyebrow ? "-mt-0.5" : "text-foreground text-sm leading-5 font-medium"}>{title}</div>
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-muted-foreground line-clamp-2 text-left text-[13px] leading-snug">{description}</p>
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        )}
        {extras && <div className="flex flex-wrap gap-1">{extras}</div>}
      </div>
    </li>
  )
}
