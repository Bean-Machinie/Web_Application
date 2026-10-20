import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { roleLabel } from "@/lib/campaign-list"
import { initialsOf } from "@/lib/profile"
import type { Campaign } from "@/lib/campaigns"
import { TruncatedText } from "./TruncatedText"

const SLIDE = 8
// Each layer keeps the full width of the open sidebar, pinned to the left, so
// collapsing only clips it: the image never moves and the text never reflows.
// The image's 6px inset centres it in the collapsed 48px button.
const LAYER =
  "absolute inset-y-0 left-0 flex w-full min-w-[calc(var(--sidebar-width)-1rem)] items-center gap-3 pr-3 pl-1.5"
// What is only there when the sidebar is open fades rather than disappearing.
const FADES = "transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0"

// The campaign image, or its initials on a muted background.
function Picture({ campaign }: { campaign: Campaign | null }) {
  if (!campaign) return <Skeleton className="size-9 shrink-0 rounded-lg" />

  return (
    <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-xs font-semibold">
      {campaign.imageUrl ? (
        <img src={campaign.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        initialsOf(campaign.name) || "?"
      )}
    </div>
  )
}

// The top of the sidebar inside a campaign: which campaign this is, and your
// role in it. Hovering or focusing the row turns it into the way back to all
// campaigns; the row keeps its height, so nothing below moves.
export function CampaignSidebarHeader({ campaign }: { campaign: Campaign | null }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const [active, setActive] = useState(false)
  // Reduced motion crossfades in place instead of sliding.
  const slide = useReducedMotion() ? 0 : SLIDE
  const transition = { duration: 0.18, ease: "easeOut" as const }

  return (
    <SidebarGroup className="px-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            size="lg"
            tooltip="All campaigns"
            className="relative h-14 min-h-14 p-0! group-data-[collapsible=icon]:size-12!"
          >
            <Link
              to="/app"
              aria-label="All campaigns"
              onClick={() => isMobile && setOpenMobile(false)}
              onPointerEnter={() => setActive(true)}
              onPointerLeave={() => setActive(false)}
              onFocus={(event) => setActive(event.currentTarget.matches(":focus-visible"))}
              onBlur={() => setActive(false)}
            >
              <span className="block h-full w-full">
                <motion.span
                  className={LAYER}
                  initial={false}
                  animate={{ opacity: active ? 0 : 1, x: active ? -slide : 0 }}
                  transition={transition}
                >
                  <Picture campaign={campaign} />
                  <span className={`flex min-w-0 flex-1 flex-col gap-0.5 ${FADES}`}>
                    {campaign ? (
                      <>
                        <TruncatedText text={campaign.name} className="text-[15px] leading-tight font-semibold" />
                        <span className="text-muted-foreground truncate text-xs leading-tight">
                          {roleLabel(campaign.role)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </>
                    )}
                  </span>
                </motion.span>
                <motion.span
                  className={LAYER}
                  initial={false}
                  animate={{ opacity: active ? 1 : 0, x: active ? 0 : slide }}
                  transition={transition}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center">
                    <ArrowLeft className="size-[18px]" />
                  </span>
                  <span className={`text-[14.5px] ${FADES}`}>
                    All campaigns
                  </span>
                </motion.span>
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
