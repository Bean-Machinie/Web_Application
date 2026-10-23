import { MapBuilderCard } from "./MapBuilderCard"
import { SectionHeading } from "./SectionHeading"

type Props = { image: string | null; onNewMap: () => void }

// The tools you can make things with, one card each, wrapping like the campaigns. A
// new tool is one more card in the grid.
export function CreateTools({ image, onNewMap }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>Tools</SectionHeading>
      <div className="flex flex-wrap gap-3">
        <div className="w-[360px] max-w-full">
          <MapBuilderCard image={image} onNewMap={onNewMap} />
        </div>
      </div>
    </section>
  )
}
