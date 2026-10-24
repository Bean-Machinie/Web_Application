import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import type { CampaignViewMode } from "@/hooks/use-campaign-view-mode"
import type { RoleFilter, Sort } from "@/lib/campaign-list"
import { CampaignSortMenu } from "./CampaignSortMenu"
import { CampaignViewToggle } from "./CampaignViewToggle"
import { FilterPopover } from "./FilterPopover"

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
      <InputGroup className="w-full sm:w-56 sm:flex-none">
        <InputGroupAddon>
          <HoverIcon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search campaigns"
          aria-label="Search campaigns"
        />
      </InputGroup>
      <FilterPopover
        groups={[
          {
            label: "Role",
            value: role,
            options: [
              { value: "all", label: "All" },
              { value: "gm", label: "GM" },
              { value: "player", label: "Player" },
            ],
            onChange: (value) => onRole(value as RoleFilter),
          },
        ]}
      />
      <CampaignSortMenu sort={sort} onSort={onSort} className="min-w-0 flex-1 sm:w-56 sm:flex-none" />
      <CampaignViewToggle mode={mode} onChange={onMode} />
      <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
        <Button variant="outline" className="flex-1 sm:flex-none" onClick={onJoin}>
          Join with invite link
        </Button>
        <Button asChild className="flex-1 sm:flex-none">
          <Link to="/app/campaigns/new">New campaign</Link>
        </Button>
      </div>
    </div>
  )
}
