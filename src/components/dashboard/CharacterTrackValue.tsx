import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { readTrack } from "@/lib/character-values"
import type { TrackValue } from "@/lib/character-values"
import { cn } from "@/lib/utils"

const MAX_LENGTH = 12

type Props = {
  value: unknown
  length: number
  onChange: (value: TrackValue) => void
  onLength: (length: number) => void
}

// A row of boxes to tick. Clicking the last ticked one unticks it. Its length is changed
// with the small buttons that show when the pointer is over it.
export function CharacterTrackValue({ value, length, onChange, onLength }: Props) {
  const filled = readTrack(value, length)

  return (
    <div className="group/track flex items-center gap-1.5">
      {Array.from({ length }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1} of ${length}`}
          aria-pressed={index < filled}
          onClick={() => onChange({ filled: index + 1 === filled ? index : index + 1 })}
          className={cn(
            "focus-visible:ring-ring size-5 rounded-full border outline-none transition-colors focus-visible:ring-2",
            index < filled ? "bg-primary border-primary" : "hover:bg-muted"
          )}
        />
      ))}
      <span className="ml-1 flex opacity-0 transition-opacity group-focus-within/track:opacity-100 group-hover/track:opacity-100">
        <Button variant="ghost" size="icon" className="size-6" aria-label="Fewer boxes" disabled={length <= 1} onClick={() => onLength(length - 1)}>
          <Minus />
        </Button>
        <Button variant="ghost" size="icon" className="size-6" aria-label="More boxes" disabled={length >= MAX_LENGTH} onClick={() => onLength(length + 1)}>
          <Plus />
        </Button>
      </span>
    </div>
  )
}
