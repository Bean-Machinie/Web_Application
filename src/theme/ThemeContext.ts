import { createContext } from "react"

export type Theme = "light" | "dark" | "system"

export type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolved: "light" | "dark"
}

export const ThemeContext = createContext<ThemeState>({
  theme: "system",
  setTheme: () => {},
  resolved: "light",
})
