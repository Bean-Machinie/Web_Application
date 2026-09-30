import { useNavigate } from "react-router-dom"
import { Link2 } from "lucide-react"
import add from "@/assets/icons/add.svg"
import checkMark from "@/assets/icons/check-mark.svg"
import globe from "@/assets/icons/globe.svg"
import { Icon } from "@/components/Icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CampaignAvatar } from "./CampaignAvatar"
import { MenuChevron } from "./MenuChevron"
import { useCampaign } from "./useCampaign"

export function CampaignSwitcher() {
  const navigate = useNavigate()
  const { campaigns, current, loading, select } = useCampaign()
  const name = current?.name ?? (loading ? "Loading…" : "No campaign")

  return (
    <SidebarGroup className="px-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-12 cursor-pointer pr-3 pl-2 group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:px-2!"
              >
                <CampaignAvatar
                  name={current?.name ?? ""}
                  imageUrl={current?.imageUrl}
                  className="size-8 shrink-0"
                />
                <div className="grid flex-1 text-left text-[14.5px] leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-[12.5px]">
                    {current ? "Campaign" : "Create or join one"}
                  </span>
                </div>
                <MenuChevron className="ml-auto rotate-180 group-data-[state=open]/menu-button:rotate-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              {campaigns.length > 0 && (
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Campaigns
                </DropdownMenuLabel>
              )}
              <DropdownMenuGroup>
                {campaigns.map((campaign) => (
                  <DropdownMenuItem
                    key={campaign.id}
                    className="gap-2 p-2"
                    onClick={() => select(campaign.id)}
                  >
                    <CampaignAvatar
                      name={campaign.name}
                      imageUrl={campaign.imageUrl}
                      className="size-6 shrink-0"
                    />
                    <span className="flex-1 truncate">{campaign.name}</span>
                    {campaign.id === current?.id && (
                      <Icon src={checkMark} className="size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {campaigns.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => navigate("/app/campaigns/new")}
              >
                <Icon src={add} />
                New campaign
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => navigate("/app/campaigns/join")}
              >
                <Link2 />
                Join with invite link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => navigate("/app/campaigns")}
              >
                <Icon src={globe} />
                All campaigns
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
