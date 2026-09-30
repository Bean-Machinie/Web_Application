import { cn } from "@/lib/utils"

// The SVGs in src/assets/icons hard-code a black stroke, so they are used as a
// mask over the current text color to follow the theme.
export function Icon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-4 shrink-0 bg-current", className)}
      style={{
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  )
}
