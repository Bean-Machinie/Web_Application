import { HeroButton } from "./HeroButton"
import { HomeCardBody } from "./HomeCardBody"

// The front card for someone with no campaign yet: make a first character.
export function HomeHeroNew({ onCreateCharacter }: { onCreateCharacter: () => void }) {
  return (
    <HomeCardBody
      title="Create a character"
      line="Choose a species, class and background. It only takes a few minutes."
      actions={<HeroButton onClick={onCreateCharacter}>Start</HeroButton>}
    />
  )
}
