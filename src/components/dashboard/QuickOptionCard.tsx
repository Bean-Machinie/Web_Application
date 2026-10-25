import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QuickOption } from "@/lib/quick-options"
import { cn } from "@/lib/utils"

type Props = { option: QuickOption; selected: boolean; onLearn: () => void; onSelect: () => void }

// One option on an option page: its name, one line from the SRD, where that is from, and the
// two ways forward.
export function QuickOptionCard({ option, selected, onLearn, onSelect }: Props) {
  return (
    <article className={cn("bg-card flex flex-col gap-4 rounded-lg border p-5 shadow-xs", selected && "border-foreground")}>
      <div className="flex flex-col gap-0.5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {option.name}
          {selected && <Check aria-label="Chosen" className="size-4" />}
        </h2>
        <p className="text-sm">{option.line}</p>
        <p className="text-muted-foreground text-xs">{option.source}</p>
      </div>
      <div className="mt-auto flex gap-2">
        <Button variant="secondary" size="sm" onClick={onLearn}>Learn more</Button>
        <Button size="sm" onClick={onSelect}>Select</Button>
      </div>
    </article>
  )
}
