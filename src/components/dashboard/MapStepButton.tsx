import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutKeys } from "@/hooks/use-shortcut-keys"
import type { ActionId } from "@/lib/shortcut-actions"

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
  const keysOf = useShortcutKeys()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={label} onClick={onClick} className={className}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent keys={action ? keysOf(action) : undefined}>{label}</TooltipContent>
    </Tooltip>
  )
}
