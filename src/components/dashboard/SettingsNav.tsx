import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SETTINGS_TABS } from "./settings-tabs"
import type { SettingsTab } from "./settings-tabs"
import { useCampaign } from "./useCampaign"

// The tabs of the settings window: down the left, and across the top on a narrow screen.
export function SettingsNav({ tab, onPick }: { tab: SettingsTab; onPick: (tab: SettingsTab) => void }) {
  const pending = useCampaign().unreadCount

  return (
    <nav
      aria-label="Settings"
      className="bg-muted/30 no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b p-3 md:w-56 md:flex-col md:overflow-visible md:border-r md:border-b-0"
    >
      <h2 className="hidden px-2.5 pt-1 pb-3 text-base font-semibold tracking-tight md:block">Settings</h2>
      {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={tab === id ? "page" : undefined}
          onClick={() => onPick(id)}
          className={cn(
            "focus-visible:ring-ring flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2",
            tab === id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <Icon className="size-4 shrink-0" />
          {label}
          {id === "notifications" && pending > 0 && (
            <Badge className="ml-auto h-5 min-w-5 rounded-full px-1.5">{pending}</Badge>
          )}
        </button>
      ))}
    </nav>
  )
}
