import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

type Props = { onCreate: () => void; onJoin: () => void }

// What someone with nothing yet sees: where to begin.
export function HomeWelcome({ onCreate, onJoin }: Props) {
  return (
    <Empty className="border border-dashed py-16">
      <EmptyHeader>
        <EmptyTitle>Welcome</EmptyTitle>
        <EmptyDescription>Build a character of your own, or join a campaign your GM has invited you to.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={onCreate}>Create character</Button>
        <Button variant="outline" onClick={onJoin}>
          Join a campaign
        </Button>
      </EmptyContent>
    </Empty>
  )
}
