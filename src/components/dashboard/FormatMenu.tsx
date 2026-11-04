import type { CSSProperties } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Option = { label: string; active: boolean; onPick: () => void; style?: CSSProperties }

type Props = {
  label: string
  // What is set at the selection now.
  current: string
  options: Option[]
  onOpenChange: (open: boolean) => void
  // The menu gives the focus back to the text, not to its own button.
  onClosed: () => void
  width?: string
}

// A choice from a short list, such as the font or its size, opening upward from the format bar.
export function FormatMenu({ label, current, options, onOpenChange, onClosed, width = "w-36" }: Props) {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={label}
          className="h-7 gap-1 px-2 text-xs"
          onMouseDown={(event) => event.preventDefault()}
        >
          <span className="truncate">{current}</span>
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={10}
        className={`${width} max-h-72`}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onClosed()
        }}
      >
        {options.map((option) => (
          <DropdownMenuItem key={option.label} onSelect={option.onPick} style={option.style} className="justify-between">
            {option.label}
            {option.active && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
