import { Link } from "react-router-dom"
import { Map as MapIcon } from "lucide-react"
import { TiltCard } from "@/components/TiltCard"
import { tiltCardSkin } from "@/components/tilt-card-styles"
import { Button } from "@/components/ui/button"

type Props = {
  // The picture on top; the surface is left plain when there is none.
  image: string | null
  onNewMap: () => void
}

// A tool, as a card like a campaign's: its picture, its name and what it does, and the
// ways in.
export function MapBuilderCard({ image, onNewMap }: Props) {
  return (
    <TiltCard className={`bg-card flex h-full flex-col rounded-lg border ${tiltCardSkin()}`}>
      <div className="bg-muted text-muted-foreground flex aspect-video items-center justify-center overflow-hidden rounded-t-[inherit]">
        {image ? <img src={image} alt="" className="size-full object-cover" /> : <MapIcon className="size-8" />}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col">
          <span className="font-medium">Map builder</span>
          <span className="text-muted-foreground text-sm">Draw land, paint biomes and place art.</span>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <Button onClick={onNewMap}>New map</Button>
          <Button asChild variant="ghost">
            <Link to="/app/library?section=maps">Browse maps</Link>
          </Button>
        </div>
      </div>
    </TiltCard>
  )
}
