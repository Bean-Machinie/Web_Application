import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { OptionDot } from "./OptionDot"

// A small coloured dot at the bottom of a card's image, with a soft outline so
// it reads on any picture. The word is only in the tooltip and the screen
// reader label. Renders nothing for kinds without a status, or when it is not
// set or not visible to this person.
export function StatusMarker({ entry }: { entry: WorldEntry }) {
  const option = WORLD_KINDS[entry.kind].fields
    .find((field) => field.key === "status")
    ?.options?.find((candidate) => candidate.value === entry.status)
  if (!option) return null

  return (
    <span
      role="img"
      aria-label={option.label}
      title={option.label}
      className="absolute bottom-2.5 left-2.5 flex rounded-full ring-2 ring-white/80 drop-shadow-sm"
    >
      <OptionDot tone={option.tone} className="size-3" />
    </span>
  )
}
