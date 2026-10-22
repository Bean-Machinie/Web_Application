import type { LucideIcon } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type Props = { icon: LucideIcon; title: string; description: string }

// What a collection page shows while it has nothing: an icon, a title and a line,
// centred in the page. No buttons until there is something they can do.
export function CollectionEmptyState({ icon: Icon, title, description }: Props) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
