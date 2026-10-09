import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import type { ActionId } from "@/lib/shortcut-actions"
import { Shortcut } from "./Shortcut"

type Props = {
  label: string
  // The key that does the same, shown in the tooltip, where there is one.
  action?: ActionId
  onClick: () => void
  children: React.ReactNode
  className?: string
}

// A small icon button with a tooltip naming it and its key.
export function MapStepButton({ label, action, onClick, children, className }: Props) {
  const keyOf = useShortcutText()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={label} onClick={onClick} className={className}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {action && <Shortcut>{keyOf(action)}</Shortcut>}
      </TooltipContent>
    </Tooltip>
  )
}
