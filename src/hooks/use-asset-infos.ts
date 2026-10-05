import { useEffect, useState } from "react"
import { loadAssetInfo, loadedAssetInfo } from "@/lib/map-assets"

// The loaded pictures of the assets a scene uses, with what was worked out about
// them, as they arrive. An id that has not loaded yet (or has no file any more)
// gives nothing.
export function useAssetInfos(ids: string[]) {
  const [, setVersion] = useState(0)
  const key = [...new Set(ids)].sort().join("|")

  useEffect(() => {
    let current = true
    for (const id of key ? key.split("|") : []) {
      if (!loadedAssetInfo(id)) {
        loadAssetInfo(id).then(() => current && setVersion((version) => version + 1))
      }
    }
    return () => {
      current = false
    }
  }, [key])

  return (id: string) => loadedAssetInfo(id)
}
