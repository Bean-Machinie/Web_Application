import { useAuth } from "@/auth/useAuth"
import { SettingsGroup } from "./SettingsGroup"
import { SettingsRow } from "./SettingsRow"

export function SecurityEmailRow() {
  const email = useAuth().session?.user.email ?? ""

  return (
    <SettingsGroup title="Account">
      <SettingsRow center width="wide" title="Email">
        <p className="flex h-8 items-center text-sm">
          <span className="truncate">{email}</span>
        </p>
      </SettingsRow>
    </SettingsGroup>
  )
}
