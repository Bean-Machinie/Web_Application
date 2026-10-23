import { readTrack } from "@/lib/character-values"
import type { TrackValue } from "@/lib/character-values"
import { cn } from "@/lib/utils"

type Props = { value: unknown; length: number; onChange: (value: TrackValue) => void }

// A row of small boxes to tick: an outline when empty, filled when marked. Clicking the
// last ticked one unticks it. How many boxes it has is changed from the field's menu.
export function CharacterTrackValue({ value, length, onChange }: Props) {
  const filled = readTrack(value, length)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1} of ${length}`}
          aria-pressed={index < filled}
          onClick={() => onChange({ filled: index + 1 === filled ? index : index + 1 })}
          className={cn(
            "focus-visible:ring-ring size-3.5 shrink-0 rounded-full border outline-none transition-colors focus-visible:ring-2",
            index < filled ? "bg-primary border-primary" : "border-muted-foreground/60 hover:bg-muted"
          )}
        />
      ))}
    </div>
  )
}
