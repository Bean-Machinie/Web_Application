import { HoverIcon } from "@/components/icons/HoverIcon"
import { PlusIcon } from "@/components/icons/PlusIcon"
import { ENTRY_KIND_IMAGES } from "@/lib/tool-images"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { SectionLabel } from "./SectionLabel"

type Props = { kinds: WorldEntryKind[]; onPick: (kind: WorldEntryKind) => void }

// One small tile per kind of entry, made like the tool tiles: a full picture, the fade at
// the foot and the kind's icon and name on it. Five across, three on a narrow screen. On
// hover or focus the picture grows, the frame takes the primary ring and a plus appears at
// the corner. The whole tile makes one.
export function CreateEntries({ kinds, onPick }: Props) {
  return (
    <section>
      <SectionLabel hint="Quickly add people, places and things to your world">New entry</SectionLabel>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
        {kinds.map((kind) => {
          const { label, icon: KindIcon } = WORLD_KINDS[kind]
          const image = ENTRY_KIND_IMAGES[kind]
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onPick(kind)}
              className="group/tile bg-muted focus-visible:border-primary focus-visible:ring-primary hover:border-primary hover:ring-primary relative block aspect-square overflow-hidden rounded-lg border text-left outline-none transition-[border-color,box-shadow] duration-200 hover:ring-1 focus-visible:ring-1"
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  className="size-full object-cover transition-transform duration-200 group-hover/tile:scale-105 group-focus-visible/tile:scale-105"
                />
              )}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100">
                <HoverIcon icon={PlusIcon} size={14} />
              </span>
              <span className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-black/45 text-white">
                  <KindIcon className="size-3.5" />
                </span>
                <span className="text-sm font-medium text-white">{label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
