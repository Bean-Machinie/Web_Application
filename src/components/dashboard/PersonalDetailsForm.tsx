import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormAlert } from "@/components/auth/FormAlert"
import { useAuth } from "@/auth/useAuth"
import {
  NO_AVATAR_CHANGE,
  deletePreviousAvatar,
  hasAvatarChange,
  uploadPendingAvatar,
} from "@/lib/avatar"
import { getProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabase"
import { AvatarUpload } from "./AvatarUpload"
import { FormFooter } from "./FormFooter"
import { SettingsSection } from "./SettingsSection"

type Notice = { tone: "error" | "success"; text: string }

export function PersonalDetailsForm() {
  const user = useAuth().session!.user
  const { firstName, lastName, jobTitle, email } = getProfile(user)
  const saved = { firstName, lastName, jobTitle, email }
  const [values, setValues] = useState(saved)
  const [avatar, setAvatar] = useState(NO_AVATAR_CHANGE)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const dirty =
    JSON.stringify(values) !== JSON.stringify(saved) || hasAvatarChange(avatar)
  const set =
    (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues({ ...values, [key]: event.target.value })

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice(null)

    const emailChanged = values.email !== saved.email
    try {
      const photo = await uploadPendingAvatar(user, avatar)
      const { error } = await supabase.auth.updateUser({
        ...(emailChanged && { email: values.email }),
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          job_title: values.jobTitle,
          ...photo,
        },
      })
      if (error) throw error
      if (hasAvatarChange(avatar)) await deletePreviousAvatar(user)
    } catch (error) {
      setBusy(false)
      const text = error instanceof Error ? error.message : "Could not save."
      return setNotice({ tone: "error", text })
    }

    setBusy(false)
    setAvatar(NO_AVATAR_CHANGE)
    setNotice({
      tone: "success",
      text: emailChanged
        ? "Saved. Confirm the new email address from your inbox to finish changing it."
        : "Your details have been saved.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y">
      <SettingsSection
        title="Your photo"
        description="This is shown across the workspace."
      >
        <AvatarUpload change={avatar} onChange={setAvatar} disabled={busy} />
      </SettingsSection>

      <SettingsSection title="Name" description="Your first and last name.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              autoComplete="given-name"
              value={values.firstName}
              onChange={set("firstName")}
              disabled={busy}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input
              id="last-name"
              autoComplete="family-name"
              value={values.lastName}
              onChange={set("lastName")}
              disabled={busy}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Email address"
        description="Used to sign in and for account notifications."
      >
        <Input
          type="email"
          aria-label="Email address"
          autoComplete="email"
          required
          value={values.email}
          onChange={set("email")}
          disabled={busy}
        />
      </SettingsSection>

      <SettingsSection
        title="Job title"
        description="Helps teammates know what you do."
      >
        <Input
          aria-label="Job title"
          autoComplete="organization-title"
          value={values.jobTitle}
          onChange={set("jobTitle")}
          disabled={busy}
        />
      </SettingsSection>

      <div>
        {notice && (
          <div className="pt-6">
            <FormAlert tone={notice.tone}>{notice.text}</FormAlert>
          </div>
        )}
        <FormFooter
          submitLabel="Save changes"
          busy={busy}
          canSubmit={dirty}
          onCancel={() => {
            setValues(saved)
            setAvatar(NO_AVATAR_CHANGE)
            setNotice(null)
          }}
        />
      </div>
    </form>
  )
}
