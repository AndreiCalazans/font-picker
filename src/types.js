/**
 * @typedef {Object} VariantMeta
 * @property {number} weight - Font weight (e.g., 400, 700)
 * @property {'normal'|'italic'} style - Font style
 */

/**
 * @typedef {Object} FontMeta
 * @property {string} id - Unique slug identifier
 * @property {string} family - Display name
 * @property {'serif'|'sans-serif'|'display'|'handwriting'|'monospace'} [category] - Font category
 * @property {VariantMeta[]} variants - Available font variants
 * @property {Object.<string, string>} files - File URLs keyed by variant (e.g., "400": url, "400italic": url)
 * @property {'google'|'uploaded'|'bundled'} source - Font source
 */

/**
 * @typedef {Object} AppState
 * @property {FontMeta[]} catalog - All available fonts
 * @property {string} [leftId] - Current left font id
 * @property {string} [rightId] - Current right font id
 * @property {string} leftBg - CSS color for left card background
 * @property {string} rightBg - CSS color for right card background
 * @property {number} sizePx - Preview size in pixels
 * @property {string} sampleText - Global sample text
 * @property {string[]} favorites - Array of font ids
 */

// Default values
export const DEFAULT_SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog";
export const DEFAULT_SIZE_PX = 32;
export const DEFAULT_BG_COLOR = "#ffffff";
export const STORAGE_KEY = "font-compare-v1";

// Font categories for filtering
export const FONT_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "display", label: "Display" },
  { value: "handwriting", label: "Handwriting" },
  { value: "monospace", label: "Monospace" },
];
