import { Fragment } from "react"
import { Link } from "react-router-dom"
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
import type { Crumb } from "@/lib/breadcrumbs"
import { usePageCrumbs } from "./usePageCrumbs"

function CrumbLink({ crumb }: { crumb: Crumb }) {
  return (
    <BreadcrumbItem className="min-w-0">
      <BreadcrumbLink asChild className="truncate">
        <Link to={crumb.to!}>{crumb.label}</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}

// The trail in the app header, such as World / Wolf. Every step but the last
// is a link. At most three steps show on any screen: when there are more, the
// middle ones fold into a "…" menu, keeping the first and the last two.
export function PageBreadcrumbs() {
  const crumbs = usePageCrumbs()

  const last = crumbs[crumbs.length - 1]
  const fold = crumbs.length > 3
  const head = fold ? crumbs.slice(0, 1) : crumbs.slice(0, -1)
  const folded = fold ? crumbs.slice(1, -2) : []
  const tail = fold ? crumbs.slice(-2, -1) : []

  return (
    <Breadcrumb className="min-w-0">
      <h1 className="sr-only">{last.label}</h1>
      <BreadcrumbList className="flex-nowrap gap-1 text-[15px] sm:gap-1.5">
        {head.map((crumb) => (
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
        {tail.map((crumb) => (
          <Fragment key={crumb.label + crumb.to}>
            <CrumbLink crumb={crumb} />
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate font-medium">{last.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
