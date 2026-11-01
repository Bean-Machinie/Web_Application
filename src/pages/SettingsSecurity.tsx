import { ConnectedAccounts } from "@/components/dashboard/ConnectedAccounts"
import { LoadingGate } from "@/components/LoadingGate"
import { SecurityEmailRow } from "@/components/dashboard/SecurityEmailRow"
import { SecurityPassword } from "@/components/dashboard/SecurityPassword"
import { SecuritySkeleton } from "@/components/dashboard/SecuritySkeleton"
import { useIdentities } from "@/hooks/use-identities"
import { useLinkResult } from "@/hooks/use-link-result"

export function SettingsSecurity() {
  const { identities, hasPassword, reload } = useIdentities()
  useLinkResult(reload)

  return (
    <div className="flex flex-col gap-10">
      <SecurityEmailRow />
      <LoadingGate
        loading={!identities || hasPassword === undefined}
        skeleton={<SecuritySkeleton />}
        className="flex flex-col gap-10"
      >
        {() => (
          <>
            <SecurityPassword hasPassword={hasPassword!} reload={reload} />
            <ConnectedAccounts identities={identities!} reload={reload} />
          </>
        )}
      </LoadingGate>
    </div>
  )
}
