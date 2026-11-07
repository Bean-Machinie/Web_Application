// A twenty-sided die in outline, in the colour of the text around it.
export function D20Icon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12,2 21.5,7.5 21.5,16.5 12,22 2.5,16.5 2.5,7.5" />
      <path d="M12 2v6.5L2.5 16.5M12 8.5l9.5 8M2.5 7.5 12 8.5l9.5-1M2.5 16.5h19M12 22l-9.5-5.5M12 22l9.5-5.5" opacity={0.6} />
    </svg>
  )
}
