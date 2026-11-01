import { DiscordIcon } from "@/components/icons/DiscordIcon"

// The providers people can connect. To offer another, add a line here with an animated icon
// for it (see DiscordIcon), such as { id: "google", label: "Google", Icon: GoogleIcon, color: "" }.
export const CONNECTED_PROVIDERS = [
  { id: "discord", label: "Discord", Icon: DiscordIcon, color: "text-[#5865F2]" },
] as const

export type ConnectedProvider = (typeof CONNECTED_PROVIDERS)[number]
