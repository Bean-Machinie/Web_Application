import { Search } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CampaignViewMode } from "@/hooks/use-campaign-view-mode"
import { defaultSort } from "@/lib/campaign-list"
import type { RoleFilter, Sort, SortKey } from "@/lib/campaign-list"
import { CampaignViewToggle } from "./CampaignViewToggle"

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
}

export function CampaignToolbar(props: Props) {
  const { query, onQuery, role, onRole, sort, onSort, mode, onMode, onJoin } = props

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="min-w-0 flex-1 sm:max-w-xs">
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
      <Select value={role} onValueChange={(value) => onRole(value as RoleFilter)}>
        <SelectTrigger aria-label="Filter by role" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="gm">Game master</SelectItem>
          <SelectItem value="player">Player</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort.by} onValueChange={(value) => onSort(defaultSort(value as SortKey))}>
        <SelectTrigger aria-label="Sort by" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="created">Created</SelectItem>
        </SelectContent>
      </Select>
      <CampaignViewToggle mode={mode} onChange={onMode} />
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" onClick={onJoin}>
          Join with invite link
        </Button>
        <Button asChild>
          <Link to="/app/campaigns/new">New campaign</Link>
        </Button>
      </div>
    </div>
  )
}
