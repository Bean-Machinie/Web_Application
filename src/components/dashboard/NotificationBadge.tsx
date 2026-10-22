// The count on the corner of the bell, centred on the corner of its 20px drawing in the middle of
// the 32px button, so it hangs off the bell instead of covering it. It pulses a few times when it
// appears or changes, then rests; people who ask for less motion get no pulse.
export function NotificationBadge({ count }: { count: number }) {
  return (
    <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex">
      <span
        key={count}
        aria-hidden
        className="bg-destructive/60 absolute inset-0 rounded-full motion-safe:animate-ping motion-safe:[animation-iteration-count:3] motion-reduce:hidden"
      />
      <span className="bg-destructive text-white ring-background relative flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums ring-2">
        {count > 9 ? "9+" : count}
      </span>
    </span>
  )
}
