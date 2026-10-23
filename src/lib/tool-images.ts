// The picture of the map builder for its card, if the file has been put in place;
// null until then. Looked up with a glob so a missing file is no build error.
const found = import.meta.glob<string>("/src/assets/tools/map-builder.png", {
  eager: true,
  query: "?url",
  import: "default",
})

export const MAP_BUILDER_IMAGE: string | null = Object.values(found)[0] ?? null
