import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command"
import { KeyChips } from "@/components/ui/key-chips"
import { usePaletteCharacters } from "@/hooks/use-palette-characters"
import { buildGroups } from "@/lib/palette-groups"
import type { SearchSource } from "@/lib/search-entries"
import type { PaletteScope } from "@/lib/palette-groups"
import type { PaletteItem } from "@/lib/palette-items"
import { loadRecents, recordRecent } from "@/lib/recent-items"
import { campaignNav, campaignSettingsNav, mainPages } from "./nav-items"
import { PaletteList } from "./PaletteList"
import { PaletteMoreRow } from "./PaletteMoreRow"
import { PaletteRow } from "./PaletteRow"
import { PaletteScopeSelect } from "./PaletteScopeSelect"
import { useCampaign } from "./useCampaign"
import { useRouteCampaign } from "./useCurrentCampaign"
import { useEntrySearch } from "./useEntrySearch"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

// Results shown per group before "Show all".
const TOP = 4

// Jump to a campaign, an entry or a page. Inside a campaign it starts by
// searching that campaign; Tab steps through the other scopes.
export function CommandPalette({ open, onOpenChange }: Props) {
  const userId = useAuth().session!.user.id
  const { campaigns } = useCampaign()
  const current = useRouteCampaign()
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const scopes: PaletteScope[] = current
    ? ["campaign", "everywhere", "campaigns", "library"]
    : ["everywhere", "campaigns", "library"]
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<PaletteScope>(scopes[0])
  const [expanded, setExpanded] = useState<string[]>([])
  const [selected, setSelected] = useState("")
  // Read when the palette opens, not on every keystroke.
  const recents = useMemo(() => (open ? loadRecents(userId) : []), [open, userId])

  // Which of the database's groups the scope asks for.
  const sources: SearchSource[] =
    scope === "library" ? ["library"] : scope === "campaign" ? ["current"] : scope === "campaigns" ? ["current", "other"] : ["current", "other", "library"]
  const hits = useEntrySearch(open, query, current?.id ?? null, sources)
  const characters = usePaletteCharacters(open)

  // Each opening, and a move into or out of a campaign, starts at the default scope.
  const defaultScope = scopes[0]
  useEffect(() => setScope(defaultScope), [open, defaultScope])

  const groups = useMemo(
    () =>
      buildGroups({
        query,
        scope,
        campaigns,
        current,
        recents,
        campaignPages: current ? [...campaignNav(current.id), ...campaignSettingsNav(current.id)] : [],
        mainPages,
        hits,
        characters,
      }),
    [query, scope, campaigns, current, recents, hits, characters]
  )
  const shown = groups.map((group) => ({
    ...group,
    visible: group.collapsible && !expanded.includes(group.heading) ? group.items.slice(0, TOP) : group.items,
  }))

  // The first result is always the selected one, whatever the search finds.
  const firstId = shown[0]?.visible[0]?.id ?? ""
  useEffect(() => setSelected(firstId), [firstId])

  function change(next: string, nextScope = scope) {
    setQuery(next)
    setScope(nextScope)
    setExpanded([])
  }

  function close(next: boolean) {
    onOpenChange(next)
    if (!next) change("")
  }

  function choose(item: PaletteItem) {
    if (item.recent) recordRecent(userId, item.recent)
    close(false)
    navigate(item.path)
  }

  function expand(heading: string, firstHidden: PaletteItem) {
    setExpanded((current) => [...current, heading])
    // The row that was asked for is gone; the next result takes the selection.
    setSelected(firstHidden.id)
  }

  function cycleScope(event: React.KeyboardEvent) {
    if (event.key !== "Tab") return
    event.preventDefault()
    const step = event.shiftKey ? scopes.length - 1 : 1
    change(query, scopes[(scopes.indexOf(scope) + step) % scopes.length])
  }

  const placeholder = {
    everywhere: "Search everywhere…",
    campaign: `Search ${current?.name ?? "this campaign"}…`,
    campaigns: "Search campaigns…",
    library: "Search your library…",
  }[scope]

  return (
    <CommandDialog
      open={open}
      onOpenChange={close}
      title="Search"
      description="Go to a campaign, an entry or a page"
      commandProps={{ value: selected, onValueChange: setSelected, loop: true }}
    >
      <CommandInput
        ref={input}
        value={query}
        onValueChange={(next) => change(next)}
        onKeyDown={cycleScope}
        placeholder={placeholder}
        trailing={
          <>
            <PaletteScopeSelect
              scope={scope}
              scopes={scopes}
              onChange={(next) => change(query, next)}
              onClosed={() => input.current?.focus()}
            />
            <KeyChips keys={["Esc"]} />
          </>
        }
      />
      <PaletteList resetKey={`${query}|${scope}`}>
        <CommandEmpty>Nothing matches “{query}”.</CommandEmpty>
        {shown.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.visible.map((item) => (
              <PaletteRow key={item.id} item={item} onSelect={choose} />
            ))}
            {group.visible.length < group.items.length && (
              <PaletteMoreRow
                heading={group.heading}
                count={group.items.length}
                onExpand={() => expand(group.heading, group.items[group.visible.length])}
              />
            )}
          </CommandGroup>
        ))}
      </PaletteList>
    </CommandDialog>
  )
}
