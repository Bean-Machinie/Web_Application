import { Link } from "react-router-dom"
import { BookOpen, Castle, DoorOpen, Plus, Sparkles, Swords } from "lucide-react"
import { MotionConfig } from "motion/react"
import { Button } from "@/components/ui/button"
import type { Campaign } from "@/lib/campaigns"
import { HomeCardBody } from "./HomeCardBody"
import { HomeDeck } from "./HomeDeck"
import type { DeckCard } from "./HomeDeckCard"
import { HomeHeroNew } from "./HomeHeroNew"
import { HomeHeroReturning } from "./HomeHeroReturning"
import { HomeNextCampaign } from "./HomeNextCampaign"
import { InviteField } from "./InviteField"

type Props = {
  // Recent campaigns, newest first (the first is the one to go back to); none for a new player.
  campaigns: Campaign[]
  // When the first of them was last opened, in milliseconds, if that was remembered.
  openedAt: number | null
  onCreateCharacter: () => void
}

const newCampaign = (
  <Button asChild size="lg">
    <Link to="/app/campaigns/new">New campaign</Link>
  </Button>
)

// The top of Home: a deck of three cards, each with art of its own. For a new player a first character,
// joining a campaign and running one; for someone who has played, their last campaign, the one
// before it, and a way to start or join another.
export function HomeHero({ campaigns, openedAt, onCreateCharacter }: Props) {
  const [last, next] = campaigns

  const cards: DeckCard[] = last
    ? [
        { key: "continue", label: "Continue", icon: BookOpen, art: "embers", render: () => <HomeHeroReturning campaign={last} openedAt={openedAt} /> },
        { key: "campaigns", label: "Campaigns", icon: Swords, art: "motes", render: () => <HomeNextCampaign campaign={next} /> },
        {
          key: "new",
          label: "New",
          icon: Plus,
          art: "ash",
          render: () => (
            <HomeCardBody
              title="New campaign"
              line="Start one, or paste an invite link."
              actions={
                <>
                  {newCampaign}
                  <InviteField />
                </>
              }
            />
          ),
        },
      ]
    : [
        { key: "character", label: "Create", icon: Sparkles, art: "embers", render: () => <HomeHeroNew onCreateCharacter={onCreateCharacter} /> },
        {
          key: "join",
          label: "Join",
          icon: DoorOpen,
          art: "motes",
          render: () => <HomeCardBody title="Join a campaign" line="Paste the invite link your GM sent you." actions={<InviteField />} />,
        },
        {
          key: "run",
          label: "Run a game",
          icon: Castle,
          art: "ash",
          render: () => <HomeCardBody title="Run your own game" line="Create a campaign and invite your players." actions={newCampaign} />,
        },
      ]

  return (
    <MotionConfig reducedMotion="user">
      <HomeDeck cards={cards} />
    </MotionConfig>
  )
}
