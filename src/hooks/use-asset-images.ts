import { useEffect, useState } from "react"
import { loadAssetImage, loadedAssetImage } from "@/lib/map-assets"

// The pictures of the assets a scene uses, as they arrive. An id with no
// picture yet (or no file any more) is missing from the result.
export function useAssetImages(ids: string[]) {
  const [, setVersion] = useState(0)
  const key = [...new Set(ids)].sort().join("|")

  useEffect(() => {
    let current = true
    for (const id of key ? key.split("|") : []) {
      if (!loadedAssetImage(id)) {
        loadAssetImage(id).then(() => current && setVersion((version) => version + 1))
      }
    }
    return () => {
      current = false
    }
  }, [key])

  return (id: string) => loadedAssetImage(id)
}
