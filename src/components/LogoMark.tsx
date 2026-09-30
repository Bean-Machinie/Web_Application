import blackIcon from "@/assets/logo/Black/HELIOSYN_Icon_Black.png"
import whiteIcon from "@/assets/logo/White/HELIOSYN_Icon_White.png"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <>
      <img draggable={false}
        src={blackIcon}
        alt=""
        className={cn("object-contain dark:hidden", className)}
      />
      <img draggable={false}
        src={whiteIcon}
        alt=""
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  )
}
