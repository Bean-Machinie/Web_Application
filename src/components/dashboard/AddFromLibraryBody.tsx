import { useEffect, useMemo, useRef } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { useLibraryPicker } from "@/hooks/use-library-picker"
import { useLibraryView } from "@/hooks/use-library-view"
import { useSelectionBox } from "@/hooks/use-selection-box"
import { MONSTERS } from "@/lib/compendium-monsters"
import type { Monster } from "@/lib/compendium-monsters"
import { SRD_PICK_SECTION } from "@/lib/library-sections"
import { srdEntry } from "@/lib/srd-entries"
import type { AddFromLibrary } from "@/lib/world-copy-flow"
import { AddFromLibraryFooter } from "./AddFromLibraryFooter"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { LibraryPickCard } from "./LibraryPickCard"
import { LibraryWindow } from "./LibraryWindow"
import { SelectionBox } from "./SelectionBox"

type Props = {
  add: AddFromLibrary
  // Left out where an SRD creature cannot be added.
  addMonster?: (monster: Monster) => Promise<unknown>
  // How many were added, and what to say about the entries that came along.
  onAdded: (count: number, note: string) => void
  onClose: () => void
  // Told whether entries are picked, so Escape lets go of them before it closes.
  onHold: (holding: boolean) => void
  // On a phone: filling a sheet, and with room for fingers.
  compact?: boolean
}

// Only mounted while the dialog is open, so it starts fresh every time. The
// library window with picking added: click, Shift-click for a range, Ctrl/Cmd+A
// for everything shown, a box dragged across the cards. "Add" copies the
// picked entries one after another.
export function AddFromLibraryBody({ add, addMonster, onAdded, onClose, onHold, compact }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const { entries, loadError, progress, error, addEntries, copyDialog } = useLibraryPicker({
    add,
    addMonster,
    onAdded,
    onClose,
  })
  const srd = useMemo(() => (addMonster ? MONSTERS.map(srdEntry) : []), [addMonster])
  const view = useLibraryView(entries, srd)
  const busy = progress !== null
  const { shown } = view

  const selection = useEntrySelection({
    visibleIds: shown?.map((entry) => entry.id) ?? [],
    allIds: [...(entries ?? []), ...srd].map((entry) => entry.id),
    // Never starts over: picks made under one section stay while looking at another.
    viewKey: "",
    container: root,
  })
  const { onPointerDown, box } = useSelectionBox({
    container: scroller,
    enabled: !busy,
    selected: selection.selected,
    onSelect: selection.set,
    onClear: selection.clear,
  })
  useEffect(() => {
    onHold(selection.active)
  }, [onHold, selection.active])

  const addSelected = () =>
    addEntries(
      [...(entries ?? []), ...srd].filter((entry) => selection.isSelected(entry.id)),
      selection.deselect
    )

  return (
    <LibraryWindow
      rootRef={root}
      entries={entries}
      shown={shown}
      section={view.section}
      onSection={view.setSection}
      query={view.query}
      onQuery={view.setQuery}
      extra={addMonster ? [{ section: SRD_PICK_SECTION, count: srd.length }] : undefined}
      loadError={loadError}
      compact={compact}
      emptyText="Your library is empty. Save entries from a campaign's World to reuse them here, or add SRD creatures."
      scroller={{ ref: scroller, onPointerDown, overlay: <SelectionBox box={box} /> }}
      renderEntry={(entry, _index, wide) => (
        <LibraryPickCard
          entry={entry}
          wide={wide}
          selected={selection.isSelected(entry.id)}
          disabled={busy}
          onToggle={(picked, event) => selection.click(picked.id, event)}
        />
      )}
      footer={
        <>
          {error && <FormAlert tone="error">{error}</FormAlert>}
          <AddFromLibraryFooter
            progress={progress}
            picked={selection.count}
            shown={shown?.length ?? 0}
            allShownPicked={selection.allVisibleSelected}
            onToggleAll={selection.allVisibleSelected ? selection.clear : selection.selectAllVisible}
            onCancel={onClose}
            onAdd={addSelected}
          />
          <CopyWithLinksDialog {...copyDialog} />
        </>
      }
    />
  )
}
