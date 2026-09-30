import * as React from "react"

const MOBILE_BREAKPOINT = 768

const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Initialised from the real viewport rather than undefined: this is a
// client-only app, so a first render at the wrong breakpoint would flash the
// desktop sidebar before the mobile drawer takes over.
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () => window.matchMedia(query).matches
  )

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)

    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
