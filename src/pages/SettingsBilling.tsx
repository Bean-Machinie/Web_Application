import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SettingsCard } from "@/components/dashboard/SettingsCard"
import { SettingsRow } from "@/components/dashboard/SettingsRow"

// Placeholders until billing is set up.
export function SettingsBilling() {
  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between gap-4 rounded-xl border p-5">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Free plan</h4>
            <Badge variant="secondary">Current</Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">Everything you need to get started.</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          Upgrade
        </Button>
      </div>

      <SettingsCard>
        <SettingsRow title="Payment method" description="The card your plan is paid with.">
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
        <SettingsRow title="Invoices" description="Receipts for what you've paid.">
          <span className="text-muted-foreground text-sm">No invoices yet</span>
        </SettingsRow>
      </SettingsCard>
    </div>
  )
}
