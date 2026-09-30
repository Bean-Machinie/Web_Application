import type { ReactNode } from "react"
import { useLoadingPhase } from "@/hooks/use-loading-phase"
import { cn } from "@/lib/utils"

type Props = {
  loading: boolean
  skeleton: ReactNode
  // A function, so it only runs once the data it needs is there.
  children: () => ReactNode
  className?: string
}

// Shows a skeleton only when loading is slow enough to notice, then fades
// the real content in over it instead of swapping abruptly. The skeleton and
// the content share this wrapper, so pass the layout classes (flex, height)
// the content needs here. An empty wrapper takes no space.
export function LoadingGate({ loading, skeleton, children, className }: Props) {
  const phase = useLoadingPhase(loading)

  if (phase === "ready") {
    return (
      <div
        className={cn(
          "animate-in fade-in duration-300 empty:hidden",
          className
        )}
      >
        {children()}
      </div>
    )
  }

  return (
    <div
      aria-busy="true"
      className={cn(
        phase === "pending" ? "invisible" : "animate-in fade-in duration-200",
        className
      )}
    >
      {skeleton}
    </div>
  )
}
