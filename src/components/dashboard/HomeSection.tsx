import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "./SectionHeading"

type Props = {
  title: string
  // Where "See all" goes; absent for a section that is not a shortcut to a page.
  seeAll?: string
  children: ReactNode
}

// A titled part of Home, with the way to the whole list at the right of the title.
export function HomeSection({ title, seeAll, children }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading>{title}</SectionHeading>
        {seeAll && (
          <Button asChild variant="ghost" size="sm">
            <Link to={seeAll}>See all</Link>
          </Button>
        )}
      </div>
      {children}
    </section>
  )
}
