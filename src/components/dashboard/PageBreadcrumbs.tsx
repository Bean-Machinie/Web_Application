import { Fragment, useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Crumb } from "@/lib/breadcrumbs"
import { BreadcrumbContext } from "./BreadcrumbContext"
import { navItems } from "./nav-items"

// Pages reached from the account menu rather than the sidebar.
const menuPages = [
  { title: "Settings", to: "/app/settings" },
  { title: "Support", to: "/app/support" },
  { title: "New campaign", to: "/app/campaigns/new" },
  { title: "Join with invite link", to: "/app/campaigns/join" },
  { title: "Campaigns", to: "/app/campaigns" },
]

function useCurrentTitle() {
  const { pathname } = useLocation()
  const match = [...navItems, ...menuPages].find(
    (item) => item.to !== "/app" && pathname.startsWith(item.to)
  )

  return match?.title ?? "Overview"
}

function CrumbLink({ crumb }: { crumb: Crumb }) {
  return (
    <BreadcrumbItem className="min-w-0">
      <BreadcrumbLink asChild className="truncate">
        <Link to={crumb.to!}>{crumb.label}</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}

// The trail in the app header, on every page: World / Characters / Tessa Vale.
// Every step but the last is a link. A page that sets no trail shows its
// title. On a phone the middle steps fold into a "…" menu so the trail fits.
export function PageBreadcrumbs() {
  const { trail } = useContext(BreadcrumbContext)
  const title = useCurrentTitle()
  const mobile = useIsMobile()

  const crumbs = trail ?? [{ label: title }]
  const last = crumbs[crumbs.length - 1]
  const before = crumbs.slice(0, -1)
  const fold = mobile && before.length > 1
  const shown = fold ? before.slice(0, 1) : before
  const folded = fold ? before.slice(1) : []

  return (
    <Breadcrumb className="min-w-0">
      <h1 className="sr-only">{last.label}</h1>
      <BreadcrumbList className="flex-nowrap gap-1 text-[15px] sm:gap-1.5">
        {shown.map((crumb) => (
          <Fragment key={crumb.label + crumb.to}>
            <CrumbLink crumb={crumb} />
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        {folded.length > 0 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="hover:text-foreground focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
                  aria-label="Show the steps in between"
                >
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {folded.map((crumb) => (
                    <DropdownMenuItem key={crumb.label + crumb.to} asChild>
                      <Link to={crumb.to!}>{crumb.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate font-medium">{last.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
