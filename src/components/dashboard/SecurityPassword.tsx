import { Skeleton } from "@/components/ui/skeleton"
import { PasswordForm } from "./PasswordForm"
import { SetPasswordForm } from "./SetPasswordForm"
import { SettingsGroup } from "./SettingsGroup"
import { SettingsRow } from "./SettingsRow"

type Props = { hasPassword: boolean | undefined; reload: () => Promise<void> }

export function SecurityPassword({ hasPassword, reload }: Props) {
  return (
    <SettingsGroup title="Password">
      {hasPassword === undefined ? (
        <SettingsRow width="field" title="Password">
          <Skeleton className="h-8 w-full" />
        </SettingsRow>
      ) : hasPassword ? (
        <PasswordForm />
      ) : (
        <SetPasswordForm onDone={reload} />
      )}
    </SettingsGroup>
  )
}
