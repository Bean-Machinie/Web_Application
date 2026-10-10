import type { SVGProps } from "react"

type Props = SVGProps<SVGSVGElement> & {
  // Cutting is the island outlined in dashes with a minus; adding is solid with a plus.
  cut?: boolean
}

// An island with a plus or a minus in it: what drawing land adds or cuts away.
export function MapLandIcon({ cut = false, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 11C4 7 7 4 11 4C14 4 15 6 18 6C21 6 21 10 20 13C19 17 15 20 11 20C7 20 4 16 4 11Z"
        strokeDasharray={cut ? "3 3" : undefined}
      />
      <path d={cut ? "M9 12h6" : "M12 9v6M9 12h6"} />
    </svg>
  )
}
