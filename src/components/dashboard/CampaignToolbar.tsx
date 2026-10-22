import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { CampaignViewMode } from "@/hooks/use-campaign-view-mode"
import type { RoleFilter, Sort } from "@/lib/campaign-list"
import { CampaignSortMenu } from "./CampaignSortMenu"
import { CampaignViewToggle } from "./CampaignViewToggle"
import { NewMenu } from "./NewMenu"

type Props = {
  query: string
  onQuery: (query: string) => void
  role: RoleFilter
  onRole: (role: RoleFilter) => void
  sort: Sort
  onSort: (sort: Sort) => void
  mode: CampaignViewMode
  onMode: (mode: CampaignViewMode) => void
  onJoin: () => void
  // What the New menu makes besides a campaign.
  onMap: () => void
  onEntry: (kind: WorldEntryKind) => void
}

export function CampaignToolbar(props: Props) {
  const { query, onQuery, role, onRole, sort, onSort, mode, onMode, onJoin } = props

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:w-56 sm:flex-none">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search campaigns"
          aria-label="Search campaigns"
        />
      </InputGroup>
      <div className="min-w-0 flex-1 sm:w-36 sm:flex-none">
      <Select value={role} onValueChange={(value) => onRole(value as RoleFilter)}>
        <SelectTrigger aria-label="Filter by role" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="gm">Game master</SelectItem>
          <SelectItem value="player">Player</SelectItem>
        </SelectContent>
      </Select>
      </div>
      <CampaignSortMenu sort={sort} onSort={onSort} className="min-w-0 flex-1 sm:w-56 sm:flex-none" />
      <CampaignViewToggle mode={mode} onChange={onMode} />
      <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
        <Button variant="outline" className="flex-1 sm:flex-none" onClick={onJoin}>
          Join with invite link
        </Button>
        <NewMenu onMap={props.onMap} onEntry={props.onEntry} className="flex-1 sm:flex-none" />
      </div>
    </div>
  )
}
