import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = { busy: boolean; children: string }

export function SubmitButton({ busy, children }: Props) {
  return (
    <Button type="submit" className="w-full" disabled={busy}>
      {busy && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Button>
  )
}
