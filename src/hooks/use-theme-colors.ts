import { useEffect, useState } from "react"

// The theme colours a canvas needs, as the browser resolves them. A canvas cannot
// read var(), so they are read from the page.
export type ThemeColors = {
  foreground: string
  mutedForeground: string
  background: string
  // The accent: what is highlighted.
  primary: string
}

function read(): ThemeColors {
  const style = getComputedStyle(document.documentElement)
  const value = (name: string) => style.getPropertyValue(name).trim()
  return {
    foreground: value("--foreground"),
    mutedForeground: value("--muted-foreground"),
    background: value("--background"),
    primary: value("--primary"),
  }
}

// Follows the light and dark switch, which sets a class on the page.
export function useThemeColors() {
  const [colors, setColors] = useState(read)

  useEffect(() => {
    const watch = new MutationObserver(() => setColors(read()))
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => watch.disconnect()
  }, [])

  return colors
}
