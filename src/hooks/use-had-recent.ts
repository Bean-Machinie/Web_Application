import { useAuth } from "@/auth/useAuth"
import { useStoredValue } from "./use-stored-value"

const write = (had: boolean) => (had ? "yes" : "no")

// Whether Recent had anything last time, remembered per user in this browser. Home uses
// it to decide before loading whether to make room for Recent, so the campaigns do not
// shift. Assumed yes until known: most people have something there.
export const useHadRecent = () => useStoredValue(`recent-had:${useAuth().session!.user.id}`, (text) => text !== "no", write)
