import type { Roll } from "@/lib/dice"

// What was thrown: "15 + 3", with two d20s the kept one first and the dropped one struck through, or a d100's "40 + 7".
export function RollBreakdown({ roll }: { roll: Roll }) {
  const modifier = roll.modifier === 0 ? "" : ` ${roll.modifier > 0 ? "+" : "−"} ${Math.abs(roll.modifier)}`
  if (roll.terms) return <>{roll.dice.join(" + ") + modifier}</>
  if (roll.sides === 100) {
    const [tens, units] = roll.dice
    return <>{`${String(tens).padStart(2, "0")} + ${units}${modifier}`}</>
  }
  const dropped = roll.dice.filter((_, index) => index !== roll.kept)
  return (
    <>
      {roll.dice[roll.kept]}
      {dropped.map((die, index) => (
        <span key={index}>
          {", "}
          <span className="line-through opacity-60">{die}</span>
        </span>
      ))}
      {modifier}
    </>
  )
}
