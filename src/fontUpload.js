/**
 * Font upload utility for handling font file uploads
 */

// Supported font file types
export const SUPPORTED_FONT_TYPES = [
  "font/woff2",
  "font/woff",
  "font/ttf",
  "font/otf",
  "application/font-woff2",
  "application/font-woff",
  "application/x-font-ttf",
  "application/x-font-otf",
  "application/octet-stream", // Some browsers use this for font files
];

export const SUPPORTED_EXTENSIONS = [".woff2", ".woff", ".ttf", ".otf"];

/**
 * Validates if a file is a supported font file
 * @param {File} file - The file to validate
 * @returns {boolean} Whether the file is supported
 */
export function isSupportedFontFile(file) {
  const hasValidType = SUPPORTED_FONT_TYPES.includes(file.type);
  const hasValidExtension = SUPPORTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  return hasValidType || hasValidExtension;
}

/**
 * Parses font metadata from filename
 * @param {string} filename - Font filename
 * @returns {Object} Parsed metadata {family, weight, style}
 */
export function parseFontFilename(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(woff2?|[ot]tf)$/i, "");

  // Common patterns:
  // FontFamily-Regular.woff2
  // FontFamily-Bold.woff2
  // FontFamily-700-Italic.woff2
  // FontFamily-BoldItalic.woff2
  // FontFamily_400_italic.woff2

  const weightMap = {
    thin: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    regular: 400,
    normal: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  };

  // Split by common separators
  const parts = nameWithoutExt.split(/[-_\s]+/);

  let family = parts[0] || "Unknown Font";
  let weight = 400;
  let style = "normal";

  // Look for weight and style in remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase();

    // Check for explicit weight numbers
    const numWeight = parseInt(part);
    if (!isNaN(numWeight) && numWeight >= 100 && numWeight <= 900) {
      weight = numWeight;
      continue;
    }

    // Check for weight names
    if (weightMap[part]) {
      weight = weightMap[part];
      continue;
    }

    // Check for italic
    if (part.includes("italic") || part.includes("oblique")) {
      style = "italic";
      continue;
    }

    // If it's not a recognized weight or style, it might be part of the family name
    if (i === 1 && !weightMap[part] && isNaN(parseInt(part))) {
      family += " " + parts[i];
    }
  }

  return { family, weight, style };
}

/**
 * Creates a FontMeta object from an uploaded file
 * @param {File} file - The uploaded font file
 * @param {Object} metadata - Optional metadata override
 * @returns {Promise<Object>} FontMeta object
 */
export async function createFontMetaFromFile(file, metadata = {}) {
  const parsed = parseFontFilename(file.name);
  const blobUrl = URL.createObjectURL(file);

  // Generate unique ID based on filename and timestamp
  const id = `uploaded-${file.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}`;

  const fontMeta = {
    id,
    family: metadata.family || parsed.family,
    category: metadata.category || "sans-serif",
    variants: [
      {
        weight: metadata.weight || parsed.weight,
        style: metadata.style || parsed.style,
      },
    ],
    files: {
      [`${metadata.weight || parsed.weight}${metadata.style === "italic" || parsed.style === "italic" ? "italic" : ""}`]:
        blobUrl,
    },
    source: "uploaded",
    originalFile: file, // Keep reference for cleanup if needed
  };

  return fontMeta;
}

/**
 * Loads an uploaded font using FontFace API
 * @param {Object} fontMeta - Font metadata from createFontMetaFromFile
 * @returns {Promise<boolean>} Success status
 */
export async function loadUploadedFont(fontMeta) {
  try {
    const variant = fontMeta.variants[0];
    const fileKey = `${variant.weight}${variant.style === "italic" ? "italic" : ""}`;
    const fontUrl = fontMeta.files[fileKey];

    if (!fontUrl) {
      throw new Error("No font file URL found");
    }

    // Create and load FontFace
    const fontFace = new FontFace(fontMeta.family, `url(${fontUrl})`, {
      weight: variant.weight.toString(),
      style: variant.style,
    });

    await fontFace.load();
    document.fonts.add(fontFace);

    console.log(
      `Loaded uploaded font: ${fontMeta.family} ${variant.weight} ${variant.style}`,
    );
    return true;
  } catch (error) {
    console.error("Failed to load uploaded font:", error);
    return false;
  }
}

/**
 * Validates and processes multiple font files
 * @param {FileList|File[]} files - Files to process
 * @returns {Promise<Object[]>} Array of FontMeta objects
 */
export async function processUploadedFonts(files) {
  const fileArray = Array.from(files);
  const validFiles = fileArray.filter(isSupportedFontFile);

  if (validFiles.length === 0) {
    throw new Error(
      "No supported font files found. Supported formats: .woff2, .woff, .ttf, .otf",
    );
  }

  const fontMetas = await Promise.all(
    validFiles.map((file) => createFontMetaFromFile(file)),
  );

  // Load all fonts
  await Promise.all(fontMetas.map((fontMeta) => loadUploadedFont(fontMeta)));

  return fontMetas;
}
