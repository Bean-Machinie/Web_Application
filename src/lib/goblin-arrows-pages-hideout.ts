// Page text in the markup of template-markup.ts.

export const HIDEOUT = `
:::gm
@{klarg} leads the raiders here. A runner from Cragmaw Castle recently ordered him to grab @{gundren}. He did, and sent Gundren and the map to @{grol}.
:::

## General features

- **Slope.** The caves climb steeply into the hill.
- **Ceilings.** High, sloping vaults, 20 to 30 feet up, hung with stalactites.
- **Light.** Areas 1 and 2 are outside. Everything else is dark.
- **Sound.** Running water muffles noise. Hearing a nearby room takes DC 15 Perception.
- **Rubble.** Loose rock is difficult terrain.
- **Stalagmites.** Provide cover.
- **Stream.** Two feet deep, cold and slow; easy to wade.

## 1. Cave Mouth

:::read-aloud
Five miles on, the trail ends at a hillside cave. A shallow stream runs out of it between walls of briar. On the right of the water, a dry path leads inside.
:::

:::gm
The goblins in area 2 should be watching but aren't. If the party is loud here (arguing, camping, hacking at bushes), they notice and shoot through the briars with half cover.
:::

## 2. Goblin Blind

:::read-aloud
On the far side of the stream, someone has hollowed out a hiding place in the briars and laid planks inside to lie on. Two goblins are lying on them.
:::

- Creatures: 2 × @{goblin}
- Sneaking up: Stealth against the goblins' passive Perception.
- **Thickets.** Difficult terrain, half cover.

## 3. Kennel

:::read-aloud
A few rough steps lead up into a small, stinking cave. Three wolves lunge to the ends of their chains, snarling. The chains run to an iron spike driven into a stalagmite.
:::

- Creatures: 3 × @{wolf}, chained. They can't reach the steps.
- Calming them: DC 15 Animal Handling, DC 10 if given food.
- **Fissure.** A chimney climbs 30 feet to area 8. Climbing: DC 10 Athletics; 6–9 no progress; 5 or less falls, 1d6 per 10 feet.

:::gm
If the wolves are taunted from out of reach, each round they make a DC 15 Strength check to pull the spike loose (DC 10 after the first success, free on the second). A goblin or Klarg can unchain one wolf as an action. Goblins ignore wolf noise.
:::

## 4. Steep Passage

:::read-aloud
The main passage climbs steeply, the stream crashing down beside it. A side passage branches off to the west across the water.
:::

:::read-aloud If they have light or darkvision
High above, a rope-and-plank bridge crosses the passage where another tunnel cuts through, twenty feet up.
:::

:::gm
The goblin on the bridge (area 5) notices anyone with a light or not moving quietly. It doesn't fight; it slips away to warn area 7 to start the flood.
:::

- **Western passage.** Rubble, difficult terrain. A ledge collapses under more than 100 lb: DC 10 Dexterity save or 2d6 bludgeoning and prone.

## 5. Overpass

:::read-aloud
Beyond more uneven steps, the passage bends east. Somewhere ahead, a waterfall roars.
:::

- Creatures: 1 × @{goblin} hiding on the bridge.
- **Bridge.** AC 5, 10 hit points. If it breaks: DC 10 Dexterity save or fall 20 feet, 2d6 bludgeoning and prone.
- Climbing to the bridge: DC 15 Athletics, the walls are wet.

### Flood!

:::gm
When the bridge goblin signals, the goblins in area 7 spend a round knocking out a dam. On the next round, water surges down from 7 to 1. Anyone in the main passage: DC 10 Dexterity save to get clear, then DC 15 Strength save to hold on, or be knocked prone and washed out to area 1 (1d6 bludgeoning). Those on the bridge or climbing are safe. A second dam is opened only if the first flood didn't work.
:::

:::read-aloud When the flood comes
A roar fills the tunnel, and a wall of water comes rushing down from above.
:::

## 6. Goblin Den

:::read-aloud
A big cave split by a ten-foot ledge, with rough steps up to the higher half. Smoke from a cooking fire hangs in the air, along with the smell of raw hides and goblin.
:::

- Creatures: 5 × @{goblin} by the fire; @{yeemik} on the upper ledge.
- Prisoner: @{sildar}, tied up on the upper ledge, 1 hit point.

:::gm
If the fight turns against him, Yeemik drags Sildar to the edge and calls for a truce. He offers Sildar in exchange for Klarg's head. Sildar warns the party not to trust him, and he's right: after the deal, Yeemik asks for more. If the party refuses, Yeemik pushes Sildar off the ledge (1d6, drops him to 0).
:::

- Treasure: Yeemik's pouch (three gold teeth, 1 gp each; 15 sp).

## 7. Twin Pools

:::read-aloud
Half the cavern is taken up by two pools held back by low stone walls. A thin waterfall feeds them from high in the east wall, and the overflow runs west as the stream. The noise drowns out everything else.
:::

:::read-aloud If a pool was released
One of the pools is now a muddy hollow, its wall broken open.
:::

- Creatures: 3 × @{goblin}. If warned, they're ready.
- Area 8 can't hear fighting here. One goblin runs to warn Klarg when a fight starts.

## 8. Klarg's Cave

:::read-aloud
Sacks and crates are piled high at the south end of a large cave. A fire pit glows in the middle. To the west, the floor slopes to a narrow hole; to the north, steps lead down toward the sound of the waterfall.
:::

- Creatures: @{klarg}, @{ripper}, 2 × @{goblin}.
- **Fire pit.** 1 fire damage for stepping in, 1d6 for falling prone in it.
- **Supplies.** Half cover. Marked with a blue lion: the @{lionshield-goods}.
- **Chimney.** Down 30 feet to area 3.

:::gm
If warned, Klarg and Ripper hide behind stalagmites and the goblins behind the crates. If not, the party can surprise them, most easily by climbing up the chimney from area 3. If Ripper dies, Klarg flees down the chimney.
:::

- Treasure: a chest among the supplies with 600 cp, 110 sp, 2 × @{healing-potion} and the @{jade-frog}.

:::gm
Award 275 XP each when the hideout is cleared. Let the players level up to 2 before moving on.
:::
`
