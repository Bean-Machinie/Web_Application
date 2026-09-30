import blackName from "@/assets/logo/Black/HELIOSYN_Name_Black.png"
import whiteName from "@/assets/logo/White/HELIOSYN_Name_White.png"
import { LogoMark } from "@/components/LogoMark"
import { cn } from "@/lib/utils"

// The title icon with the HELIOSYN name beside it. The name sits a little
// closer than the images' own margins would put it.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <LogoMark className="size-16 shrink-0" />
      <img
        draggable={false}
        src={blackName}
        alt="Heliosyn"
        className="-ml-3 h-12 max-w-none shrink-0 dark:hidden"
      />
      <img
        draggable={false}
        src={whiteName}
        alt="Heliosyn"
        className="-ml-3 hidden h-12 max-w-none shrink-0 dark:block"
      />
    </div>
  )
}
