import { ChevronsUpDown } from "lucide-react"
import { CommandItem } from "@/components/ui/command"

type Props = { heading: string; count: number; onExpand: () => void }

// The row that lists the rest of a group in place, by click or Enter.
export function PaletteMoreRow({ heading, count, onExpand }: Props) {
  return (
    <CommandItem
      value={`more:${heading}`}
      onSelect={onExpand}
      className="text-muted-foreground animate-in fade-in-0 py-1.5 duration-100"
    >
      <span className="flex size-6 shrink-0 items-center justify-center">
        <ChevronsUpDown className="size-4" />
      </span>
      <span>Show all ({count})</span>
    </CommandItem>
  )
}
