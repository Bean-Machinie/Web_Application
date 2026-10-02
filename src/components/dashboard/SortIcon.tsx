type Props = {
  // Null is unsorted: an arrowhead at both ends.
  direction: "asc" | "desc" | null
  className?: string
}

// One vertical line with small arrowheads. All three states share the same
// line, so the icon does not change size when a column becomes sorted.
export function SortIcon({ direction, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 3v18" />
      {direction !== "desc" && <path d="m8 7 4-4 4 4" />}
      {direction !== "asc" && <path d="m8 17 4 4 4-4" />}
    </svg>
  )
}
