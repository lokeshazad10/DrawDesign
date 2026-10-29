// Shared constants: tools, palettes, default style.

export const ACCENT = "#0c8599";

export const TOOLS = [
  { id: "select", label: "Select", key: "v", num: "1" },
  { id: "hand", label: "Hand (pan)", key: "h", num: "" },
  { id: "rectangle", label: "Rectangle", key: "r", num: "2" },
  { id: "diamond", label: "Diamond", key: "d", num: "3" },
  { id: "ellipse", label: "Ellipse", key: "o", num: "4" },
  { id: "arrow", label: "Arrow", key: "a", num: "5" },
  { id: "line", label: "Line", key: "l", num: "6" },
  { id: "freedraw", label: "Draw", key: "p", num: "7" },
  { id: "text", label: "Text", key: "t", num: "8" },
  { id: "eraser", label: "Eraser", key: "e", num: "0" },
];

export const STROKE_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
];
export const BACKGROUND_COLORS = [
  "transparent",
  "#ffc9c9",
  "#b2f2bb",
  "#a5d8ff",
  "#ffec99",
];

export const FONTS = {
  hand: 'Caveat, "Comic Sans MS", cursive',
  sans: '"Instrument Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

export const FONT_SIZES = [
  { label: "S", value: 18 },
  { label: "M", value: 26 },
  { label: "L", value: 38 },
  { label: "XL", value: 54 },
];

export const DEFAULT_STYLE = {
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  fillStyle: "hachure",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  fontSize: 26,
  fontFamily: "hand",
};

export const GRID_SIZE = 20;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;
export const PAPER = "#fcfcfb";
