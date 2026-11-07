import type { ComponentProps } from "react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

type Props = ComponentProps<"div"> & { selected?: boolean; asChild?: boolean }

// The one row of a list: the library's tree and its list view. Hover is muted, the open one accent.
export function ListRow({ selected, asChild, className, ...props }: Props) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-selected={selected || undefined}
      className={cn("hover:bg-muted data-[selected]:bg-accent data-[selected]:text-accent-foreground flex h-7 min-w-0 items-center rounded-md", className)}
      {...props}
    />
  )
}
