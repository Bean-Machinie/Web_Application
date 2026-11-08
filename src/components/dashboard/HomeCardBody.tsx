import type { ReactNode } from "react"

type Props = {
  title: string
  // One line of fact under the title.
  line?: ReactNode
  actions: ReactNode
}

// What a card of the deck says when it is in front: the title, one muted line and the actions, on the
// left, with the room at the right left to the art.
export function HomeCardBody({ title, line, actions }: Props) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-8">
      <h2 className="truncate text-2xl font-semibold tracking-tight">{title}</h2>
      {line && <div className="text-muted-foreground text-sm">{line}</div>}
      <div className="mt-3 flex flex-wrap items-center gap-3">{actions}</div>
    </div>
  )
}
