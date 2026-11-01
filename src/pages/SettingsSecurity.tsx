import { ConnectedAccounts } from "@/components/dashboard/ConnectedAccounts"
import { SecurityEmailRow } from "@/components/dashboard/SecurityEmailRow"
import { SecurityPassword } from "@/components/dashboard/SecurityPassword"
import { useIdentities } from "@/hooks/use-identities"
import { useLinkResult } from "@/hooks/use-link-result"

export function SettingsSecurity() {
  const { identities, hasPassword, reload } = useIdentities()
  useLinkResult(reload)

  return (
    <div className="flex flex-col gap-10">
      <SecurityEmailRow />
      <SecurityPassword hasPassword={hasPassword} reload={reload} />
      <ConnectedAccounts identities={identities} reload={reload} />
    </div>
  )
}
