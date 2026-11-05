import { cn } from "@/lib/utils"

// A tiny app window. The "light" and "dark" classes carry the real theme tokens, so it matches the app in either theme.
export function ThemeMock({ tone, className }: { tone: "light" | "dark"; className?: string }) {
  return (
    <div className={cn(tone, "bg-background absolute inset-0 flex", className)}>
      <div className="bg-sidebar border-border w-1/4 space-y-1 border-r p-1.5">
        <div className="bg-muted-foreground/40 h-1 w-full rounded-full" />
        <div className="bg-muted-foreground/25 h-1 w-3/4 rounded-full" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="bg-header border-border h-3 border-b" />
        <div className="grid flex-1 grid-cols-2 gap-1.5 p-1.5">
          <div className="bg-card border-border rounded-sm border" />
          <div className="bg-card border-border rounded-sm border" />
        </div>
      </div>
    </div>
  )
}
