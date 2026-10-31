import type { ComponentProps } from "react"
import type { AnimatedIconComponent } from "@/components/AnimatedIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = Omit<ComponentProps<typeof Button>, "children"> & {
  icon: AnimatedIconComponent
  // Names the button, and is what its tooltip says.
  label: string
  // A word beside the icon, for the one button that needs it.
  text?: string
}

// A button of the toolbar, an icon alone unless it has text, with what it does said on hover. The span
// carries the tooltip so that it also shows while the button is disabled.
export function QuickHeaderIconButton({ icon, label, text, ...props }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button variant="outline" size={text ? "default" : "icon"} aria-label={label} {...props}>
            <HoverIcon icon={icon} />
            {text}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
