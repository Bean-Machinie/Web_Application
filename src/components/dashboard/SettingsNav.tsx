import { ChevronRight } from "lucide-react"
import { Icon } from "@/components/Icon"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AccountIdentity } from "./AccountIdentity"
import { SETTINGS_GROUPS } from "./settings-tabs"
import type { SettingsTab } from "./settings-tabs"
import { useCampaign } from "./useCampaign"

type Props = { tab: SettingsTab; onPick: (tab: SettingsTab) => void }

// The tabs of the settings window, grouped under quiet labels. On a small screen this is the
// first page, and the tab picked slides in over it.
export function SettingsNav({ tab, onPick }: Props) {
  const pending = useCampaign().unreadCount

  return (
    <nav
      aria-label="Settings"
      className="bg-muted/40 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:border-r md:p-3"
    >
      <h2 className="px-1 pt-1 text-lg font-semibold tracking-tight md:sr-only">Settings</h2>
      <div className="flex items-center gap-2.5 px-2.5">
        <AccountIdentity />
      </div>
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <h3 className="text-muted-foreground px-2.5 pb-1 text-xs font-medium">{group.label}</h3>
          {group.tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              aria-current={tab === id ? "page" : undefined}
              onClick={() => onPick(id)}
              className={cn(
                "focus-visible:bg-accent/70 flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm font-medium outline-none transition-colors md:py-1.5",
                tab === id
                  ? "md:bg-accent md:text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon src={icon} />
              {label}
              {id === "notifications" && pending > 0 && (
                <Badge className="ml-auto h-5 min-w-5 rounded-full px-1.5">{pending}</Badge>
              )}
              <ChevronRight
                className={cn("text-muted-foreground size-4 md:hidden", id === "notifications" && pending > 0 ? "" : "ml-auto")}
              />
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
