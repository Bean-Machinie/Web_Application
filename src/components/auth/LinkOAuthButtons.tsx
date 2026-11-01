import { useRef, useState } from "react"
import type { IconHandle } from "@/components/AnimatedIcon"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { CONNECTED_PROVIDERS } from "@/components/dashboard/connected-providers"
import type { ConnectedProvider } from "@/components/dashboard/connected-providers"
import { authProblem } from "@/lib/auth-errors"
import { guestReturnUrl } from "@/lib/auth-next"
import { supabase } from "@/lib/supabase"

function LinkButton({ provider, onClick }: { provider: ConnectedProvider; onClick: () => void }) {
  const icon = useRef<IconHandle>(null)

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onClick}
      onMouseEnter={() => icon.current?.startAnimation()}
      onMouseLeave={() => icon.current?.stopAnimation()}
    >
      <provider.Icon ref={icon} size={16} className={provider.color} />
      Continue with {provider.label}
    </Button>
  )
}

// A guest links a provider to the account they already have, never signs in with it:
// signing in would start a different account and leave their work behind.
export function LinkOAuthButtons() {
  const [error, setError] = useState<string>()

  async function link(provider: ConnectedProvider) {
    setError(undefined)
    const { error } = await supabase.auth.linkIdentity({
      provider: provider.id,
      options: { redirectTo: guestReturnUrl(provider.id) },
    })
    if (error) setError(authProblem(error).message)
  }

  return (
    <div className="grid gap-2">
      {CONNECTED_PROVIDERS.map((provider) => (
        <LinkButton key={provider.id} provider={provider} onClick={() => link(provider)} />
      ))}
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
