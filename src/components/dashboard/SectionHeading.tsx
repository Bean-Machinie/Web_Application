import type { ReactNode } from "react"

// A section heading, not a page title: the breadcrumb names the page. Home's
// "Campaigns" and Create's "Tools" are this, in a row as tall as the toolbar's.
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 items-center">
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
    </div>
  )
}
