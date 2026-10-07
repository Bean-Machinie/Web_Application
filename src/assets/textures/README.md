# Ground textures

The painted ground of the map: the sea, the land, and the ground of each biome.
Each is a **tile**, one picture that repeats over the whole map. Put a tile in this
folder with the right name, reload the builder, and it is used. That's all.

## The files

| File           | What it is the ground of        |
| -------------- | ------------------------------- |
| `land.png`     | land with no biome painted on it |
| `sea.png`      | the sea                         |
| `ice.png`      | the ice biome                   |
| `swamp.png`    | the swamp biome                 |
| `desert.png`   | the desert biome                |
| `volcanic.png` | the volcanic biome              |

`.webp` and `.jpg` work too. **A tile that is not there is not an error:** that
ground keeps the look the code makes for it, so tiles can be added one at a time.
`land-grain.png` and `water-grain.png` are that generated look's grain, and are
only used where there is no tile of the real thing.

## How a tile is used

The tile is used **as painted**. The map applies two things to it, and nothing
else: one colour grade, shared with the painted art (a little saturation,
contrast and warmth, set per background in `src/lib/map-theme.ts`), and an
optional light tint (`terrainTint` in the same file). It is not recoloured, so the
colours you paint are the colours you see.

The code also **hides the repeat**: a second copy of the tile, larger and turned a
quarter, is mixed in over large soft patches, and the light and dark of the
ground drift gently over still larger ones. This helps a lot, but it can't hide
an obvious mark that appears again and again, so see "Making it repeat well".

The sea's **contour lines and the coast's dark band are drawn by the code on top
of the sea tile**, and so are the coast's ink line and the land's soft shadow.
Do not paint any of these into a tile.

## The rules

- **Seamless**, in both directions: the left edge must join the right edge, and the
  top the bottom, with no visible seam.
- **Square**, **1024 × 1024 px**. 2048 × 2048 gives more variety if you want it.
  One tile covers about **512 map pixels** (the map is 3072 to 3840 px wide), so a
  1024 px tile has two pixels to each map pixel. This keeps it sharp in the
  published picture, which is drawn larger than the builder.
- **No transparency.** Every pixel is opaque.
- **sRGB colour**, PNG (best), or WebP or JPG at high quality.
- **Brushwork at the size of the art's**: marks about 6 to 30 map pixels across
  (12 to 60 px in a 1024 px tile), in the same painting style as the map's assets.
- **Lower contrast than the assets**, so trees, hills and mountains stand out on it
  and not the other way round.
- **Soft, even light.** No shadows or highlights from one direction, no vignette,
  and no darker or lighter corner or edge. The tile repeats, so any such thing
  would show as a grid.
- **Muted, earthy colours** in keeping with the rest of the map. The land should be
  close to the land colour in `src/lib/map-theme.ts`, and the sea to the sea's, so
  that the generated and painted looks do not clash while only some tiles exist.
- **The same average lightness and contrast across all the biome tiles and the
  land.** Biomes are blended into each other and into the land by the players, so
  a tile much brighter or darker than its neighbours would show as a band in the
  blend. Colour can be as different as you like, but how light it is should match.

## Making it repeat well

Avoid anything that the eye picks out and would notice coming round again: a
single big flower, a stone, a dark blotch, a bright patch, a bird. Spread detail
evenly, with many similar marks and no stand-outs.

### Checking for seams

In **Photoshop**: Filter → Other → Offset, with Horizontal and Vertical both set to
half the width (512 for a 1024 tile) and "Wrap Around" on. The old edges are now a
cross through the middle of the picture; any seam shows there. Paint it out and
check again.

In **Krita**: Image → Offset Image (Shift+Ctrl+O), set to half in both directions, with wrap
on. In **GIMP**: Layer → Transform → Offset, by half in x and y, "Wrap around".

Then **tile it 3 × 3** (or use the pattern preview in your painting program) and
look at the whole at once, small. Repeats and grid patterns jump out at that size.
Squint and ask: can I see where the tile starts and stops?

### Checking it on the map

Drop the file in this folder and reload the builder: the land or sea changes at
once. Try it zoomed out (to see the repeat), and with biomes painted, with the
art placed on it, and with the sea's lines around some land.
