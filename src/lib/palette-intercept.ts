// A page can take over what the search palette does with a result: the journal
// opens it as a tab instead of going to its address. Returns whether it did.
type Intercept = (path: string) => boolean

let current: Intercept | null = null

// Returns the way to stop intercepting.
export function interceptPalette(handler: Intercept) {
  current = handler
  return () => {
    if (current === handler) current = null
  }
}

export const paletteIntercepted = (path: string) => current?.(path) ?? false
