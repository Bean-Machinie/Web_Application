import type { ReactNode } from "react"

type Props = { children: ReactNode; description?: string }

// A section heading, not a page title: the breadcrumb names the page. With a description it
// is the title over a muted line saying what the section is for; without one it is a row as
// tall as a toolbar.
export function SectionHeading({ children, description }: Props) {
  return (
    <div className={description ? "flex flex-col gap-1" : "flex h-9 items-center"}>
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  )
}
