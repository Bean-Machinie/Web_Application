import { useCharacters } from "@/hooks/use-characters"
import { MONSTERS } from "@/lib/compendium-monsters"
import { CHARACTERS_SECTION, SRD_SECTIONS } from "@/lib/library-sections"
import { RULE_ENTRIES } from "@/lib/rules-terms"
import { SRD_LABEL } from "@/lib/srd-paths"
import type { WorldEntry } from "@/lib/world-entries"
import { LibrarySections, Row } from "./LibrarySections"

type Props = {
  // Mine's entries, for its counts; null while they load.
  entries: WorldEntry[] | null
  // The source the page is showing, and its open section.
  source: "mine" | "srd"
  active: string
  onMine: (sectionId: string) => void
  onSrd: (sectionId: string) => void
}

const SRD_COUNTS: Record<string, number> = { creatures: MONSTERS.length, rules: RULE_ENTRIES.length }

function Source({ name }: { name: string }) {
  return <h2 className="text-muted-foreground px-3 pt-1 text-xs font-semibold tracking-wide uppercase">{name}</h2>
}

// The column beside the library: its two sources, Mine (editable) and the SRD (read only), each
// with its own sections and counts.
export function LibrarySidebar({ entries, source, active, onMine, onSrd }: Props) {
  const { characters } = useCharacters()
  const mine = source === "mine"

  return (
    <div className="flex w-48 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Source name="Mine" />
        <LibrarySections
          entries={entries}
          active={mine ? active : ""}
          onChange={onMine}
          extra={[{ section: CHARACTERS_SECTION, count: characters?.length ?? null }]}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Source name={SRD_LABEL} />
        <div role="tablist" aria-label={SRD_LABEL} aria-orientation="vertical" className="-m-1 flex flex-col gap-0.5 p-1">
          {SRD_SECTIONS.map((section) => (
            <Row key={section.id} section={section} entries={null} active={mine ? "" : active} onChange={onSrd} depth={0} count={SRD_COUNTS[section.id]} />
          ))}
        </div>
      </div>
    </div>
  )
}
