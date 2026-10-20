import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { campaignPath } from "@/lib/campaign-paths"
import { CommandPalette } from "./CommandPalette"
import { CommandPaletteContext } from "./CommandPaletteContext"
import { useRouteCampaign } from "./useCurrentCampaign"
import { useRecordRecent } from "./useRecordRecent"

// Ctrl/Cmd+K opens the palette from anywhere in the app, including inside a
// campaign and while typing in a field.
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const campaign = useRouteCampaign()
  useRecordRecent(
    campaign && {
      key: `campaign:${campaign.id}`,
      name: campaign.name,
      path: campaignPath(campaign.id),
      context: "Campaign",
      visual: { type: "campaign", name: campaign.name, imageUrl: campaign.imageUrl },
    }
  )
  const value = useMemo(() => ({ open: () => setOpen(true) }), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
      if (event.key.toLowerCase() !== "k") return
      event.preventDefault()
      setOpen((current) => !current)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  )
}
