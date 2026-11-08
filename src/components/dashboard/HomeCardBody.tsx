import type { ReactNode } from "react"

type Props = {
  title: ReactNode
  // One line of fact under the title.
  line?: ReactNode
  // Anything between the line and the actions, such as who is in a campaign.
  extra?: ReactNode
  actions: ReactNode
}

// What a Home tile says, as one block at its bottom left: the title, one muted line and the actions.
export function HomeCardBody({ title, line, extra, actions }: Props) {
  return (
    <div className="flex h-full flex-col justify-end gap-1.5 p-6">
      <h2 className="truncate text-xl font-semibold tracking-tight">{title}</h2>
      {line && <div className="text-muted-foreground line-clamp-2 text-sm">{line}</div>}
      {extra}
      <div className="mt-2 flex flex-wrap items-center gap-3">{actions}</div>
    </div>
  )
}
