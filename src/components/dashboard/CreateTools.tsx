import type { ComponentProps, ReactNode } from "react"
import { Hammer, Map as MapIcon, User } from "lucide-react"
import { CHARACTER_CREATOR_IMAGE } from "@/lib/tool-images"
import { SectionLabel } from "./SectionLabel"
import { ToolPlaceholder } from "./ToolPlaceholder"
import { ToolTile } from "./ToolTile"

type Props = {
  image: string | null
  onNewMap: () => void
  onNewCharacter: () => void
  // More tiles after the two tools. Given, the row is four across with lower tiles, under the
  // heading "Create", and the placeholder is left out.
  extra?: ReactNode
}

// Lower than a square, so a row of four does not take the page.
export const TALL = "aspect-[4/3]"

type Tool =
  | ({ placeholder?: false } & ComponentProps<typeof ToolTile>)
  | ({ placeholder: true } & ComponentProps<typeof ToolPlaceholder>)

// The tools you can make things with, one tile each, three across (two on a narrow screen).
// A new tool is one more entry in the list, and the fourth starts a new row. The last entry
// is a placeholder: replace it with the real tool when there is one.
export function CreateTools({ image, onNewMap, onNewCharacter, extra }: Props) {
  const tools: Tool[] = [
    {
      name: "Map Maker",
      tagline: "Paint world and region maps",
      icon: MapIcon,
      image,
      onOpen: onNewMap,
      className: extra ? TALL : undefined,
    },
    {
      name: "Character Creator",
      tagline: "Build a character in minutes",
      icon: User,
      image: CHARACTER_CREATOR_IMAGE,
      onOpen: onNewCharacter,
      className: extra ? TALL : undefined,
    },
    ...(extra ? [] : [{ name: "More tools", tagline: "In the works", icon: Hammer, placeholder: true } as const]),
  ]

  return (
    <section>
      <SectionLabel hint="Full editors for maps and characters">{extra ? "Create" : "Tools"}</SectionLabel>
      <div className={extra ? "grid grid-cols-2 gap-4 lg:grid-cols-4" : "grid grid-cols-2 gap-4 md:grid-cols-3"}>
        {tools.map((tool) =>
          tool.placeholder ? (
            <ToolPlaceholder key={tool.name} name={tool.name} tagline={tool.tagline} icon={tool.icon} />
          ) : (
            <ToolTile key={tool.name} {...tool} />
          )
        )}
        {extra}
      </div>
    </section>
  )
}
