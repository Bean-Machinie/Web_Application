import { cn } from "@/lib/utils"

// Must sit inside a Radix trigger button that is a `group/menu-button`
// (SidebarMenuButton), which is what exposes data-state.
export function MenuChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 transition-transform duration-200 ease-out group-data-[state=open]/menu-button:rotate-180",
        className,
      )}
    >
      <path d="M5 15L11.2929 8.70711C11.6834 8.31658 12.3166 8.31658 12.7071 8.70711L19 15" />
    </svg>
  )
}
