import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SettingsGroup } from "@/components/dashboard/SettingsGroup"
import { SettingsRow } from "@/components/dashboard/SettingsRow"

// Placeholders until billing is set up.
export function SettingsBilling() {
  return (
    <div className="flex flex-col gap-10">
      <SettingsGroup title="Plan">
        <SettingsRow center title="Free plan" description="Everything you need to get started.">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Current</Badge>
            <Button variant="outline" size="sm" disabled>
              Upgrade
            </Button>
          </div>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Payment">
        <SettingsRow center title="Payment method" description="The card your plan is paid with.">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <CreditCard className="size-4" />
              None added
            </span>
            <Button variant="secondary" size="sm" disabled>
              Add
            </Button>
          </div>
        </SettingsRow>
        <SettingsRow center title="Invoices" description="Receipts for what you've paid.">
          <span className="text-muted-foreground text-sm">No invoices yet</span>
        </SettingsRow>
      </SettingsGroup>
    </div>
  )
}
