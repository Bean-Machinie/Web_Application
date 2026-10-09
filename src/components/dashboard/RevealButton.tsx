import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  revealed: boolean
  name: string
  onChange: (revealed: boolean) => void
}

// An open eye means players can see the entry; closing it hides it again.
export function RevealButton({ revealed, name, onChange }: Props) {
  const Icon = revealed ? Eye : EyeOff
  const action = revealed ? "Hide from players" : "Reveal to players"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 ${revealed ? "text-muted-foreground" : "text-foreground"}`}
          aria-label={`${action}: ${name}`}
          aria-pressed={!revealed}
          onClick={() => onChange(!revealed)}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{action}</TooltipContent>
    </Tooltip>
  )
}
