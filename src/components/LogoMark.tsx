import blackIcon from "@/assets/logo/Black/HELIOSYN_Icon_Black.png"
import whiteIcon from "@/assets/logo/White/HELIOSYN_Icon_White.png"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <>
      <img
        src={blackIcon}
        alt=""
        className={cn("object-contain dark:hidden", className)}
      />
      <img
        src={whiteIcon}
        alt=""
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  )
}
