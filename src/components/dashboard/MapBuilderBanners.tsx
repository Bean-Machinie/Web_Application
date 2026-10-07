import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import type { useSceneAutosave } from "@/hooks/use-scene-autosave"
import { SCENE_LIMIT_BYTES } from "@/lib/world-map-scenes"

// How much of the most a map can hold it may take before the builder warns.
const SIZE_WARNING = 0.7

type Props = {
  autosave: ReturnType<typeof useSceneAutosave>
  // What went wrong with publishing, if anything.
  error: string | null
}

// What the builder has to say under the top bar: a draft that could not be
// saved, a map near its size limit, a publish that failed.
export function MapBuilderBanners({ autosave, error }: Props) {
  return (
    <>
      {autosave.state === "conflict" && (
        <div className="flex items-center gap-3 border-b px-3 py-2">
          <FormAlert tone="error">{autosave.error ?? "Saving failed."}</FormAlert>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      )}
      {autosave.bytes > SCENE_LIMIT_BYTES * SIZE_WARNING && (
        <div className="border-b px-3 py-2">
          <FormAlert tone="warning">
            {`This map is getting large: ${(autosave.bytes / 2 ** 20).toFixed(1)} MB of the ${SCENE_LIMIT_BYTES / 2 ** 20} MB a map can hold. Past that it cannot be saved. Clear some paint or land to make room.`}
          </FormAlert>
        </div>
      )}
      {error && (
        <div className="border-b px-3 py-2">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      )}
    </>
  )
}
