import { useRef } from "react"
import type { UserIdentity } from "@supabase/supabase-js"
import type { IconHandle } from "@/components/AnimatedIcon"
import { Button } from "@/components/ui/button"
import type { ConnectedProvider } from "./connected-providers"

type Props = {
  provider: ConnectedProvider
  identity: UserIdentity | undefined
  // Supabase does not remove an account's last linked identity, password or not.
  isOnlyIdentity: boolean
  busy: boolean
  onConnect: () => void
  onDisconnect: () => void
}

// The name or email the provider knows the person by.
function accountName(identity: UserIdentity) {
  const data = (identity.identity_data ?? {}) as Record<string, string | undefined>
  return data.full_name ?? data.name ?? data.user_name ?? data.email ?? ""
}

export function ProviderRow({ provider, identity, isOnlyIdentity, busy, onConnect, onDisconnect }: Props) {
  const icon = useRef<IconHandle>(null)

  return (
    <div
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
      className="grid gap-2 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-8"
    >
      <div className="flex items-center gap-2.5">
        <provider.Icon ref={icon} size={22} className={provider.color} />
        <span className="text-sm font-medium">{provider.label}</span>
      </div>
      <div className="flex min-h-8 min-w-0 items-center justify-between gap-3 sm:max-w-sm">
        <span className="text-muted-foreground truncate text-sm">
          {identity ? accountName(identity) : "Not connected"}
        </span>
        {identity ? (
          !isOnlyIdentity && (
            <Button variant="outline" size="sm" disabled={busy} onClick={onDisconnect}>
              Disconnect
            </Button>
          )
        ) : (
          <Button variant="outline" size="sm" disabled={busy} onClick={onConnect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  )
}
