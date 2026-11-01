import { useState } from "react"
import type { Provider } from "@supabase/supabase-js"
import { DiscordIcon, GoogleIcon } from "@/components/auth/BrandIcons"
import { FormAlert } from "@/components/auth/FormAlert"
import { Button } from "@/components/ui/button"
import { authProblem } from "@/lib/auth-errors"
import { supabase } from "@/lib/supabase"

type Props = { next: string; disabled: boolean }

export function OAuthButtons({ next, disabled }: Props) {
  const [error, setError] = useState<string>()

  async function start(provider: Provider) {
    setError(undefined)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${next}` },
    })
    if (error) setError(authProblem(error).message)
  }

  return (
    <div className="grid gap-2">
      <Button variant="outline" className="w-full" disabled={disabled} onClick={() => start("discord")}>
        <DiscordIcon />
        Continue with Discord
      </Button>
      <Button variant="outline" className="w-full" disabled={disabled} onClick={() => start("google")}>
        <GoogleIcon />
        Continue with Google
      </Button>
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
