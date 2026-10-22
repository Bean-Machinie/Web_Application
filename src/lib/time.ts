const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
]

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

// "just now", "5 minutes ago", "yesterday", "3 weeks ago".
export function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit)
    }
  }
  return "just now"
}

// "just now", "5m ago", "2h ago", "3d ago", "2w ago", "4mo ago", "1y ago".
export function shortAgo(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  const steps: [string, number][] = [
    ["y", 365 * 24 * 60 * 60],
    ["mo", 30 * 24 * 60 * 60],
    ["w", 7 * 24 * 60 * 60],
    ["d", 24 * 60 * 60],
    ["h", 60 * 60],
    ["m", 60],
  ]
  for (const [unit, size] of steps) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${unit} ago`
  }
  return "just now"
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

// "Today", "Yesterday" or "Earlier", for grouping a list by day.
export function dayGroup(iso: string) {
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / (24 * 60 * 60 * 1000))
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : "Earlier"
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

// "Sep 30, 2026".
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))
