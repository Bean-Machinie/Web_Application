import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { FormAlert } from "@/components/auth/FormAlert"
import { CampaignAvatar } from "@/components/dashboard/CampaignAvatar"
import { FullScreenLayout } from "@/components/FullScreenLayout"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/auth/useAuth"
import { errorMessage, joinCampaign } from "@/lib/campaigns"
import { saveCurrentCampaignId } from "@/lib/current-campaign"
import { fetchInvitePreview } from "@/lib/invitations"

type Preview = { name: string; imageUrl: string | null }

// Public on purpose: people without an account open invite links too. They
// are asked to sign up or log in, and come back here afterwards.
export function Invite() {
  const code = useSearchParams()[0].get("code") ?? ""
  const { session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [preview, setPreview] = useState<Preview | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitePreview(code)
      .then(setPreview)
      .catch((failure) => {
        setPreview(null)
        setError(errorMessage(failure))
      })
  }, [code])

  async function accept() {
    setBusy(true)
    setError(null)
    try {
      saveCurrentCampaignId(await joinCampaign(code))
      navigate("/app", { replace: true })
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  if (authLoading || preview === undefined) return <FullScreenSpinner />

  const here = { from: `/invite?code=${encodeURIComponent(code)}` }

  return (
    <FullScreenLayout>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          {preview ? (
            <>
              <CampaignAvatar
                name={preview.name}
                imageUrl={preview.imageUrl}
                className="mb-2 size-24 text-3xl"
              />
              <CardDescription>You have been invited to join</CardDescription>
              <CardTitle className="text-xl">{preview.name}</CardTitle>
            </>
          ) : (
            <>
              <CardTitle className="text-xl">Invite not valid</CardTitle>
              <CardDescription>
                This invite link has been reset or is not correct. Ask your GM
                for a new one.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && <FormAlert tone="error">{error}</FormAlert>}
          {preview && session && (
            <>
              <Button onClick={accept} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/campaigns")}
                disabled={busy}
              >
                Decline
              </Button>
            </>
          )}
          {preview && !session && (
            <>
              <p className="text-muted-foreground text-center text-sm">
                Create an account to accept, or log in if you already have one.
              </p>
              <Button asChild>
                <Link to="/signup" state={here}>
                  Create an account
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login" state={here}>
                  Log in
                </Link>
              </Button>
            </>
          )}
          {!preview && session && (
            <Button variant="outline" onClick={() => navigate("/campaigns")}>
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    </FullScreenLayout>
  )
}
