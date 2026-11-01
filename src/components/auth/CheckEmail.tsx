import { useState } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { AuthLayout } from "@/components/auth/AuthLayout"

type Props = {
  email: string
  // Resolves to an error message, or undefined when the email went out.
  onResend: () => Promise<string | undefined>
}

export function CheckEmail({ email, onResend }: Props) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ tone: "error" | "success"; text: string }>()

  async function resend() {
    setBusy(true)
    const error = await onResend()
    setBusy(false)
    setResult(error ? { tone: "error", text: error } : { tone: "success", text: "Email sent again." })
  }

  return (
    <AuthLayout
      title="Check your email"
      description={
        <>
          We sent a link to <span className="text-foreground font-medium">{email}</span>.
        </>
      }
    >
      <div className="flex flex-col gap-3 text-center">
        <p className="text-muted-foreground text-sm">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={busy}
            className="text-foreground underline underline-offset-4 disabled:opacity-50"
          >
            Resend email
          </button>
        </p>
        {result && <FormAlert tone={result.tone}>{result.text}</FormAlert>}
      </div>
    </AuthLayout>
  )
}
