import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { defaultSort, roleLabel } from "@/lib/campaign-list"
import type { Sort, SortKey } from "@/lib/campaign-list"
import type { Member } from "@/lib/campaign-members"
import { campaignPath } from "@/lib/campaign-paths"
import type { Campaign } from "@/lib/campaigns"
import { formatDate } from "@/lib/time"
import { CampaignImage } from "./CampaignImage"
import { CampaignMemberStack } from "./CampaignMemberStack"
import { CampaignMenu } from "./CampaignMenu"
import { SortableHead } from "./SortableHead"
import { worldCellClass, worldHeadClass } from "./members-table-styles"

type Props = {
  campaigns: Campaign[]
  members: Record<string, Member[]>
  sort: Sort
  onSort: (sort: Sort) => void
  onLeave: (campaign: Campaign) => void
}

const headClass = `${worldHeadClass} uppercase tracking-wide`

export function CampaignTable({ campaigns, members, sort, onSort, onLeave }: Props) {
  // Clicking the sorted column flips it; another column starts at its usual order.
  const toggle = (by: SortKey) =>
    onSort(sort.by === by ? { by, dir: sort.dir === "asc" ? "desc" : "asc" } : defaultSort(by))

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <SortableHead
              label="Campaign"
              direction={sort.by === "name" ? sort.dir : null}
              onSort={() => toggle("name")}
              base={headClass}
            />
            <TableHead className={headClass}>Role</TableHead>
            <TableHead className={`${headClass} hidden md:table-cell`}>Members</TableHead>
            <SortableHead
              label="Created"
              direction={sort.by === "created" ? sort.dir : null}
              onSort={() => toggle("created")}
              base={headClass}
              className="hidden sm:table-cell"
            />
            <TableHead className={headClass}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="relative">
              <TableCell className={worldCellClass}>
                <div className="flex items-center gap-3">
                  <CampaignImage name={campaign.name} imageUrl={campaign.imageUrl} />
                  <Link
                    to={campaignPath(campaign.id)}
                    className="truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-ring focus-visible:after:ring-2 focus-visible:after:ring-inset"
                  >
                    {campaign.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell className={worldCellClass}>
                <Badge variant="secondary">{roleLabel(campaign.role)}</Badge>
              </TableCell>
              <TableCell className={`${worldCellClass} hidden md:table-cell`}>
                <CampaignMemberStack members={members[campaign.id]} />
              </TableCell>
              <TableCell className={`${worldCellClass} text-muted-foreground hidden sm:table-cell`}>
                {formatDate(campaign.createdAt)}
              </TableCell>
              <TableCell className={`${worldCellClass} w-12`}>
                <div className="relative z-10 flex justify-end">
                  <CampaignMenu campaign={campaign} onLeave={onLeave} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
