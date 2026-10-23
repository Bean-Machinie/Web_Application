import { Map as MapIcon } from "lucide-react"
import { SectionHeading } from "./SectionHeading"
import { ToolTile } from "./ToolTile"

type Props = { image: string | null; onNewMap: () => void }

// The tools you can make things with, one tile each, left to right. A new tool is one
// more tile.
export function CreateTools({ image, onNewMap }: Props) {
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
      </div>
    </section>
  )
}
