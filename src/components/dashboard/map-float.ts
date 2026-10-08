// One look for everything floating over a map, so it reads as one family: a
// soft translucent surface with a slight blur, the app's radius and a light
// shadow. The row version has the one height they all share, which is also
// the size of a button inside them.
export const MAP_FLOAT =
  "bg-background/70 border rounded-lg shadow-sm backdrop-blur-md"
export const MAP_FLOAT_ROW = `${MAP_FLOAT} h-10`
// The square buttons in them.
export const MAP_FLOAT_BUTTON = "size-10 rounded-lg"
