import type { ComponentProps } from "react"
import { Hammer, Map as MapIcon, User } from "lucide-react"
import { CHARACTER_CREATOR_IMAGE } from "@/lib/tool-images"
import { SectionLabel } from "./SectionLabel"
import { ToolPlaceholder } from "./ToolPlaceholder"
import { ToolTile } from "./ToolTile"

type Props = { image: string | null; onNewMap: () => void; onNewCharacter: () => void }

type Tool =
  | ({ placeholder?: false } & ComponentProps<typeof ToolTile>)
  | ({ placeholder: true } & ComponentProps<typeof ToolPlaceholder>)

// The tools you can make things with, one tile each, three across (two on a narrow screen).
// A new tool is one more entry in the list, and the fourth starts a new row. The last entry
// is a placeholder: replace it with the real tool when there is one.
export function CreateTools({ image, onNewMap, onNewCharacter }: Props) {
  const tools: Tool[] = [
    {
      name: "Map Maker",
      tagline: "Paint world and region maps",
      description: "Draw land, paint biomes and place art.",
      icon: MapIcon,
      image,
      onOpen: onNewMap,
    },
    {
      name: "Character Creator",
      tagline: "Build a character in minutes",
      description: "Build a player character.",
      icon: User,
      image: CHARACTER_CREATOR_IMAGE,
      onOpen: onNewCharacter,
    },
    { name: "More tools", tagline: "In the works", icon: Hammer, placeholder: true },
  ]

  return (
    <section>
      <SectionLabel hint="Full editors for maps and characters">Tools</SectionLabel>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tools.map((tool) =>
          tool.placeholder ? (
            <ToolPlaceholder key={tool.name} name={tool.name} tagline={tool.tagline} icon={tool.icon} />
          ) : (
            <ToolTile key={tool.name} {...tool} />
          )
        )}
      </div>
    </section>
  )
}
