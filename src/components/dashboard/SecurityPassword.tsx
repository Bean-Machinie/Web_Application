import { PasswordForm } from "./PasswordForm"
import { SetPasswordForm } from "./SetPasswordForm"
import { SettingsGroup } from "./SettingsGroup"

type Props = { hasPassword: boolean; reload: () => Promise<void> }

export function SecurityPassword({ hasPassword, reload }: Props) {
  return (
    <SettingsGroup title="Password">
      {hasPassword ? <PasswordForm /> : <SetPasswordForm onDone={reload} />}
    </SettingsGroup>
  )
}
