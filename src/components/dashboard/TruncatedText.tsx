import { useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Props = { text: string; className?: string }

// Text on one line that ends in "…" when it does not fit. Only then does a
// tooltip show the whole of it.
export function TruncatedText({ text, className }: Props) {
  const element = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const cut = () => !!element.current && element.current.scrollWidth > element.current.clientWidth

  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && cut())}>
      <TooltipTrigger asChild>
        <span ref={element} className={cn("block truncate", className)}>
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">{text}</TooltipContent>
    </Tooltip>
  )
}
