import { Map as MapIcon, User } from "lucide-react"
import { SectionHeading } from "./SectionHeading"
import { ToolTile } from "./ToolTile"

type Props = { image: string | null; onNewMap: () => void; onNewCharacter: () => void }

// The tools you can make things with, one tile each, left to right. A new tool is one
// more tile.
export function CreateTools({ image, onNewMap, onNewCharacter }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>Tools</SectionHeading>
      <div className="flex flex-wrap items-start gap-4">
        <ToolTile
          name="Map builder"
          description="Draw land, paint biomes and place art."
          icon={MapIcon}
          image={image}
          onOpen={onNewMap}
        />
        <ToolTile
          name="Character creator"
          description="Build a player character."
          icon={User}
          image={null}
          onOpen={onNewCharacter}
        />
      </div>
    </section>
  )
}
