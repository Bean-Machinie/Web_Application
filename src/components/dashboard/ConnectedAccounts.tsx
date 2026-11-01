import { useState } from "react"
import type { UserIdentity } from "@supabase/supabase-js"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { authProblem } from "@/lib/auth-errors"
import { supabase } from "@/lib/supabase"
import { ConfirmDialog } from "./ConfirmDialog"
import { CONNECTED_PROVIDERS } from "./connected-providers"
import type { ConnectedProvider } from "./connected-providers"
import { ProviderRow } from "./ProviderRow"
import { SettingsGroup } from "./SettingsGroup"

type Props = { identities: UserIdentity[] | undefined; reload: () => Promise<void> }

export function ConnectedAccounts({ identities, reload }: Props) {
  const [leaving, setLeaving] = useState<ConnectedProvider | null>(null)
  const [busy, setBusy] = useState(false)

  const title = "Connected accounts"

  if (!identities) {
    return (
      <SettingsGroup title={title}>
        <div className="py-4">
          <Skeleton className="h-8 w-full" />
        </div>
      </SettingsGroup>
    )
  }

  const identityOf = (id: string) => identities.find((identity) => identity.provider === id)

  async function connect(provider: ConnectedProvider) {
    setBusy(true)
    // Leaves for the provider, and comes back to this same window. The
    // provider is named in the address so the result can be reported.
    const back = new URL(window.location.href)
    back.hash = ""
    back.searchParams.set("provider", provider.id)
    const { error } = await supabase.auth.linkIdentity({
      provider: provider.id,
      options: { redirectTo: back.toString() },
    })
    setBusy(false)
    if (error) toast.error(authProblem(error).message)
  }

  async function disconnect() {
    const identity = leaving && identityOf(leaving.id)
    if (!leaving || !identity) return

    setBusy(true)
    const { error } = await supabase.auth.unlinkIdentity(identity)
    if (error) {
      toast.error(authProblem(error).message)
    } else {
      toast.success(`${leaving.label} disconnected.`)
      await reload()
    }
    setBusy(false)
    setLeaving(null)
  }

  return (
    <SettingsGroup title={title}>
      {CONNECTED_PROVIDERS.map((provider) => (
        <ProviderRow
          key={provider.id}
          provider={provider}
          identity={identityOf(provider.id)}
          isOnlyIdentity={identities.length <= 1}
          busy={busy}
          onConnect={() => connect(provider)}
          onDisconnect={() => setLeaving(provider)}
        />
      ))}
      <ConfirmDialog
        open={leaving !== null}
        title={`Disconnect ${leaving?.label ?? "this account"}?`}
        description="You will no longer be able to log in with it. Your campaigns and characters stay as they are."
        confirmLabel="Disconnect"
        busy={busy}
        error={null}
        onCancel={() => setLeaving(null)}
        onConfirm={disconnect}
      />
    </SettingsGroup>
  )
}
