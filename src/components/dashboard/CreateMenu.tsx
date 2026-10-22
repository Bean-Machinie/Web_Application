import { useMemo, useRef, useState } from "react"
import { Link, useMatch } from "react-router-dom"
import { Users } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import type { IconHandle } from "@/components/AnimatedIcon"
import { IconButton } from "@/components/IconButton"
import { PlusIcon } from "@/components/PlusIcon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { can } from "@/lib/campaign-permissions"
import { campaignScope, libraryScope } from "@/lib/world-scope"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { NewEntryDialog } from "./NewEntryDialog"
import { NewMapDialog } from "./NewMapDialog"
import { useRouteCampaign } from "./useCurrentCampaign"
import { WorldScopeContext } from "./WorldScopeContext"

// The "+" in the top bar, on every page: make something. The first group, under a label
// naming where it goes, is a map or an entry: into the campaign you are in (if you manage
// its world, otherwise the group is left out), or into your library anywhere else. A
// campaign is always possible, under a separator.
export function CreateMenu() {
  const userId = useAuth().session?.user.id
  const campaign = useRouteCampaign()
  const inCampaign = useMatch("/app/c/:campaignId/*") !== null
  const [makingMap, setMakingMap] = useState(false)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState(false)
  const plus = useRef<IconHandle>(null)
  // Closing the menu gives the button its focus back, which would show the tooltip over
  // the page you just clicked; it stays quiet until the pointer comes to the button again.
  const quiet = useRef(false)

  const scope = useMemo(() => {
    if (inCampaign) {
      return campaign && can(campaign.role, "manage_world") ? campaignScope(campaign.id, true) : null
    }
    return userId ? libraryScope(userId) : null
  }, [inCampaign, campaign, userId])
  const destination = inCampaign ? (campaign?.name ?? "") : "Library"
  // The map first, then the kinds of entry.
  const kinds: WorldEntryKind[] = scope ? ["map", ...scope.kinds.filter((kind) => kind !== "map")] : []

  return (
    <>
      <DropdownMenu
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          setTip(false)
          if (next) plus.current?.startAnimation()
          else {
            plus.current?.stopAnimation()
            quiet.current = true
          }
        }}
      >
        <Tooltip open={tip && !open} onOpenChange={(next) => setTip(next && !quiet.current)}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={PlusIcon}
                label="Create"
                animateRef={plus}
                onPointerEnter={() => (quiet.current = false)}
              />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Create</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" side="bottom" className="w-[220px]">
          {scope && (
            <>
              <DropdownMenuLabel className="text-muted-foreground truncate text-xs font-normal">
                {destination}
              </DropdownMenuLabel>
              {kinds.map((kind) => {
                const { label, icon: KindIcon } = WORLD_KINDS[kind]
                return (
                  <DropdownMenuItem
                    key={kind}
                    onSelect={() => (kind === "map" ? setMakingMap(true) : setCreating(kind))}
                  >
                    <KindIcon />
                    {label}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link to="/app/campaigns/new">
              <Users />
              New campaign
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {scope && (
        <WorldScopeContext.Provider value={scope}>
          <NewMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
          <NewEntryDialog kind={creating} reload={async () => {}} onClose={() => setCreating(null)} />
        </WorldScopeContext.Provider>
      )}
    </>
  )
}
