import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command"
import { KeyChips } from "@/components/ui/key-chips"
import { buildGroups } from "@/lib/palette-groups"
import type { PaletteItem } from "@/lib/palette-items"
import { loadRecents, recordRecent } from "@/lib/recent-items"
import { campaignNav, campaignSettingsNav, mainPages } from "./nav-items"
import { PaletteRow } from "./PaletteRow"
import { useCampaign } from "./useCampaign"
import { useRouteCampaign } from "./useCurrentCampaign"
import { usePaletteData } from "./usePaletteData"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

// Jump to a campaign, an entry or a page. What it lists depends on where you
// are: inside a campaign that campaign's world and pages come first.
export function CommandPalette({ open, onOpenChange }: Props) {
  const userId = useAuth().session!.user.id
  const { campaigns } = useCampaign()
  const current = useRouteCampaign()
  const navigate = useNavigate()
  const data = usePaletteData(open, current?.id ?? null)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState("")
  // Read when the palette opens, not on every keystroke.
  const recents = useMemo(() => (open ? loadRecents(userId) : []), [open, userId])

  const groups = useMemo(
    () =>
      buildGroups({
        query,
        campaigns,
        current,
        recents,
        campaignPages: current ? [...campaignNav(current.id), ...campaignSettingsNav(current.id)] : [],
        mainPages,
        campaignEntries: data.campaignEntries,
        libraryEntries: data.libraryEntries,
      }),
    [query, campaigns, current, recents, data.campaignEntries, data.libraryEntries]
  )

  // The first result is always the selected one, whatever the search finds.
  const firstId = groups[0]?.items[0]?.id ?? ""
  useEffect(() => setSelected(firstId), [firstId])

  function close(next: boolean) {
    onOpenChange(next)
    if (!next) setQuery("")
  }

  function choose(item: PaletteItem) {
    if (item.recent) recordRecent(userId, item.recent)
    close(false)
    navigate(item.path)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={close}
      title="Search"
      description="Go to a campaign, an entry or a page"
      commandProps={{ value: selected, onValueChange: setSelected, loop: true }}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder={current ? `Search ${current.name}…` : "Search campaigns and library…"}
        trailing={<KeyChips keys={["Esc"]} />}
      />
      <CommandList>
        <CommandEmpty>Nothing matches “{query}”.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <PaletteRow key={item.id} item={item} onSelect={choose} />
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
