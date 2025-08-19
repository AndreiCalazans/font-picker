/**
 * Font loading utility using FontFace API
 */

// Cache for loaded fonts
const loadedFonts = new Set();
const loadingPromises = new Map();

/**
 * Creates a cache key for a font variant
 * @param {string} family - Font family name
 * @param {number} weight - Font weight
 * @param {string} style - Font style ('normal' or 'italic')
 * @returns {string} Cache key
 */
export function createFontKey(family, weight, style) {
  return `${family}-${weight}-${style}`;
}

/**
 * Gets the variant key for a font file URL
 * @param {number} weight - Font weight
 * @param {string} style - Font style
 * @returns {string} Variant key for files object
 */
export function getVariantKey(weight, style) {
  return style === "italic" ? `${weight}italic` : `${weight}`;
}

/**
 * Loads a font variant using FontFace API
 * @param {Object} fontMeta - Font metadata
 * @param {number} weight - Font weight to load
 * @param {string} style - Font style to load
 * @returns {Promise<boolean>} Promise that resolves when font is loaded
 */
export async function loadFont(fontMeta, weight = 400, style = "normal") {
  if (!fontMeta || !fontMeta.files) {
    console.warn("Invalid font metadata:", fontMeta);
    return false;
  }

  const cacheKey = createFontKey(fontMeta.family, weight, style);

  // Already loaded
  if (loadedFonts.has(cacheKey)) {
    return true;
  }

  // Already loading
  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey);
  }

  const variantKey = getVariantKey(weight, style);
  const fontUrl = fontMeta.files[variantKey];

  if (!fontUrl) {
    console.warn(
      `No font file found for ${fontMeta.family} ${weight} ${style}`,
    );
    // Try fallback to normal weight
    const fallbackKey = getVariantKey(400, style);
    const fallbackUrl = fontMeta.files[fallbackKey];

    if (!fallbackUrl) {
      // Try normal style as final fallback
      const finalFallbackKey = getVariantKey(400, "normal");
      const finalFallbackUrl = fontMeta.files[finalFallbackKey];

      if (!finalFallbackUrl) {
        console.warn(`No fallback font file found for ${fontMeta.family}`);
        return false;
      }
    }
  }

  const actualUrl =
    fontUrl ||
    fontMeta.files[getVariantKey(400, style)] ||
    fontMeta.files[getVariantKey(400, "normal")];

  if (!actualUrl) {
    return false;
  }

  const loadingPromise = (async () => {
    try {
      // Check if FontFace is supported
      if (typeof FontFace === "undefined") {
        console.warn("FontFace API not supported");
        return false;
      }

      // Create FontFace object
      const fontFace = new FontFace(fontMeta.family, `url(${actualUrl})`, {
        weight: weight.toString(),
        style: style,
      });

      // Load the font
      await fontFace.load();

      // Add to document fonts
      document.fonts.add(fontFace);

      // Mark as loaded
      loadedFonts.add(cacheKey);

      console.log(`Loaded font: ${fontMeta.family} ${weight} ${style}`);
      return true;
    } catch (error) {
      console.error(
        `Failed to load font ${fontMeta.family} ${weight} ${style}:`,
        error,
      );
      return false;
    } finally {
      loadingPromises.delete(cacheKey);
    }
  })();

  loadingPromises.set(cacheKey, loadingPromise);
  return loadingPromise;
}

/**
 * Preloads all variants of a font
 * @param {Object} fontMeta - Font metadata
 * @returns {Promise<boolean[]>} Array of loading results
 */
export async function preloadFont(fontMeta) {
  if (!fontMeta || !fontMeta.variants) {
    return [];
  }

  const loadPromises = fontMeta.variants.map((variant) =>
    loadFont(fontMeta, variant.weight, variant.style),
  );

  return Promise.all(loadPromises);
}

/**
 * Checks if a font variant is loaded
 * @param {string} family - Font family name
 * @param {number} weight - Font weight
 * @param {string} style - Font style
 * @returns {boolean} Whether the font is loaded
 */
export function isFontLoaded(family, weight, style) {
  const cacheKey = createFontKey(family, weight, style);
  return loadedFonts.has(cacheKey);
}

/**
 * Gets the best available variant for a font
 * @param {Object} fontMeta - Font metadata
 * @param {number} preferredWeight - Preferred font weight
 * @param {string} preferredStyle - Preferred font style
 * @returns {Object} Best available variant {weight, style}
 */
export function getBestVariant(
  fontMeta,
  preferredWeight = 400,
  preferredStyle = "normal",
) {
  if (!fontMeta || !fontMeta.variants || fontMeta.variants.length === 0) {
    return { weight: 400, style: "normal" };
  }

  // Try exact match first
  const exactMatch = fontMeta.variants.find(
    (v) => v.weight === preferredWeight && v.style === preferredStyle,
  );
  if (exactMatch) return exactMatch;

  // Try same style, different weight
  const sameStyle = fontMeta.variants.filter((v) => v.style === preferredStyle);
  if (sameStyle.length > 0) {
    // Find closest weight
    const closest = sameStyle.reduce((prev, curr) =>
      Math.abs(curr.weight - preferredWeight) <
      Math.abs(prev.weight - preferredWeight)
        ? curr
        : prev,
    );
    return closest;
  }

  // Try normal style, same weight
  const normalStyle = fontMeta.variants.find(
    (v) => v.weight === preferredWeight && v.style === "normal",
  );
  if (normalStyle) return normalStyle;

  // Return first available variant
  return fontMeta.variants[0];
}
