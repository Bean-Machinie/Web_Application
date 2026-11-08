import { useEffect, useState } from "react"
import { landGrid } from "@/lib/land-grid"
import { landRoute, seedOf } from "@/lib/land-route"
import type { RoutePoint } from "@/lib/land-route"

type Found = { src: string; aspect: number; route: RoutePoint[] | null }

// A map picture's shape and a route over its land; the route is null when there is too little land or
// its pixels cannot be read, and the whole is null until the picture has loaded.
export function useLandRoute(src: string | null) {
  const [found, setFound] = useState<Found | null>(null)

  useEffect(() => {
    if (!src) return
    let current = true
    const load = (cors: boolean) => {
      const image = new Image()
      if (cors) image.crossOrigin = "anonymous"
      image.onload = () => {
        if (!current) return
        const grid = cors ? landGrid(image) : null
        setFound({ src, aspect: image.naturalWidth / image.naturalHeight, route: grid && landRoute(grid, seedOf(src)) })
      }
      // Loaded again without asking leave to read it, for its shape at least.
      if (cors) image.onerror = () => current && load(false)
      image.src = src
    }
    load(true)
    return () => {
      current = false
    }
  }, [src])

  return found?.src === src ? found : null
}
