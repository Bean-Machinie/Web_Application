// How the SRD 5.2.1 generates ability scores, with the page each rule is on. Numbers only.
// The point costs are POINT_BUY_* in srd-5-2-1.ts, and the Standard Array by Class table is
// STANDARD_ARRAY_BY_CLASS there.

// p. 21 (Generate Your Scores, Standard Array): the six scores to assign.
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// p. 21 (Generate Your Scores, Random Generation): roll four d6, record the total of the highest
// three, and do it six times in all.
export const ROLL = { scores: 6, dice: 4, sides: 6, keep: 3 }

// p. 21 (Assign Ability Scores): each of the six numbers goes to one of the six abilities.
// p. 21 (Adjust Ability Scores): the background's increase is +2 and +1 to two of its three
// abilities, or +1 to all three; none can raise a score above 20 (ABILITY_CAP in srd-5-2-1.ts).
