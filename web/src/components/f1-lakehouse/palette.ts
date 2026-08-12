/**
 * Chart color, computed rather than eyeballed (see the dataviz skill).
 *
 * Sequential magnitude (bar length) reuses the site's own gold ramp — the same
 * three stops as `.gold-text` in index.css — so ranked bars stay on-brand.
 *
 * Categorical identity (pie slices) uses the dataviz skill's default 8-hue
 * order, validated with `validate_palette.js` against this app's real dark
 * card surface (#18181b, read from @heroui/styles' `.dark` tokens): all of
 * lightness band, chroma floor, adjacent CVD separation (worst 8.4), the
 * normal-vision floor (worst 19.3), and contrast passed at every slot.
 */

const GOLD_STOPS = ["#f8dc94", "#f0b341", "#c9871c"] as const;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r} ${g} ${bl})`;
}

/** `t` in [0,1], 0 = lowest magnitude (lightest), 1 = highest (deepest gold). */
export function goldStep(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (GOLD_STOPS.length - 1);
  const i = Math.min(GOLD_STOPS.length - 2, Math.floor(scaled));
  return mixHex(GOLD_STOPS[i], GOLD_STOPS[i + 1], scaled - i);
}

/** Fixed-order categorical slots, dark mode — never cycled, never reordered. */
export const CATEGORICAL = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
] as const;

export const CARD_SURFACE = "#18181b";
