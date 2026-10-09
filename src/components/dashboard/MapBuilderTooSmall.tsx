import { Link } from "react-router-dom"
import { ArrowLeft, MonitorSmartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

// Over the map builder, which stays as it is underneath, when the screen is too
// small for it: turning the device or widening the window takes this away again.
export function MapBuilderTooSmall({ mapId }: { mapId: string }) {
  return (
    <div className="bg-background fixed inset-0 z-[60] flex min-h-dvh flex-col items-center justify-center gap-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <MonitorSmartphone className="text-muted-foreground size-10" />
      <div className="max-w-xs">
        <h1 className="text-base font-semibold">The map builder needs a larger screen</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Open it on a computer or a tablet held sideways. Your map is saved as you left it.
        </p>
      </div>
      <Button asChild className="min-h-11 px-5">
        <Link to={`/app/world/${mapId}`} replace>
          <ArrowLeft />
          Back to the map
        </Link>
      </Button>
    </div>
  )
}
