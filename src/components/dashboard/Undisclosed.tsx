
export function Undisclosed() {
  return (
    <span className="bg-muted text-muted-foreground flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
      <HoverIcon icon={LockIcon} size={12} />
      Undisclosed
    </span>
  )
}import { HoverIcon } from "@/components/icons/HoverIcon"
import { LockIcon } from "@/components/icons/LockIcon"

