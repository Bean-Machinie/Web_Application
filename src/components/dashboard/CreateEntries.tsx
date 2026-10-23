import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { SectionHeading } from "./SectionHeading"

type Props = { kinds: WorldEntryKind[]; onPick: (kind: WorldEntryKind) => void }

const BLURB: Partial<Record<WorldEntryKind, string>> = {
  character: "A person in your world",
  creature: "A beast or monster",
  location: "A place",
  item: "An object",
  lore: "History, myths and notes",
}

// One card per kind of entry, in a grid that fits as many as the width allows, made like
// the campaign cards. The whole card makes one.
export function CreateEntries({ kinds, onPick }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>Entries</SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {kinds.map((kind) => {
          const { label, icon: KindIcon } = WORLD_KINDS[kind]
          return (
            <TiltCard key={kind} className={`bg-card flex rounded-lg border ${tiltCardSkin()}`}>
              <button
                type="button"
                onClick={() => onPick(kind)}
                className="focus-visible:after:ring-ring flex w-full flex-col gap-3 p-4 text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-lg focus-visible:after:ring-2"
              >
                <span className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-lg">
                  <KindIcon className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground text-sm">{BLURB[kind]}</span>
                </span>
              </button>
            </TiltCard>
          )
        })}
      </div>
    </section>
  )
}
