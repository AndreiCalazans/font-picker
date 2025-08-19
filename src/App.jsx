import { useState, useEffect, useMemo } from "react";
import {
  DEFAULT_SAMPLE_TEXT,
  DEFAULT_SIZE_PX,
  DEFAULT_BG_COLOR,
  STORAGE_KEY,
  FONT_CATEGORIES,
} from "./types";
import { fallbackFonts } from "./fallbackFonts";
import { loadFont, getBestVariant, isFontLoaded } from "./fontLoader";
import { processUploadedFonts, SUPPORTED_EXTENSIONS } from "./fontUpload";
import "./App.css";

function App() {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};

      return {
        catalog: fallbackFonts,
        leftId: parsed.leftId || fallbackFonts[0]?.id,
        rightId: parsed.rightId || fallbackFonts[1]?.id,
        backgroundColor: parsed.backgroundColor || DEFAULT_BG_COLOR,
        weight: parsed.weight || 400,
        style: parsed.style || "normal",
        sizePx: parsed.sizePx || DEFAULT_SIZE_PX,
        sampleText: parsed.sampleText || DEFAULT_SAMPLE_TEXT,
        favorites: parsed.favorites || [],
        // UI state
        showFontPicker: false,
        fontPickerSide: null,
        showUpload: false,
        showFavorites: false,
        // Font loading state
        loadingFonts: new Set(),
        // Upload state
        uploadError: null,
        isUploading: false,
        // Font picker state
        fontSearch: "",
        fontCategoryFilter: "",
      };
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return {
        catalog: fallbackFonts,
        leftId: fallbackFonts[0]?.id,
        rightId: fallbackFonts[1]?.id,
        backgroundColor: DEFAULT_BG_COLOR,
        weight: 400,
        style: "normal",
        sizePx: DEFAULT_SIZE_PX,
        sampleText: DEFAULT_SAMPLE_TEXT,
        favorites: [],
        showFontPicker: false,
        fontPickerSide: null,
        showUpload: false,
        showFavorites: false,
        loadingFonts: new Set(),
        uploadError: null,
        isUploading: false,
        fontSearch: "",
        fontCategoryFilter: "",
      };
    }
  });

  // Persist state to localStorage whenever relevant fields change
  useEffect(() => {
    const {
      catalog,
      showFontPicker,
      fontPickerSide,
      showUpload,
      showFavorites,
      loadingFonts,
      uploadError,
      isUploading,
      fontSearch,
      fontCategoryFilter,
      ...persistedState
    } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [state]);

  // Load fonts when font IDs or variants change
  useEffect(() => {
    const loadFontsForSide = async (fontId, weight, style, side) => {
      const font = getFontById(fontId);
      if (!font) return;

      const loadingKey = `${fontId}-${weight}-${style}`;
      if (state.loadingFonts.has(loadingKey)) return;

      setState((s) => ({
        ...s,
        loadingFonts: new Set([...s.loadingFonts, loadingKey]),
      }));

      try {
        // Try to load the exact variant first
        const success = await loadFont(font, weight, style);
        
        // If loading the italic style failed, also try to load the normal style
        // so we have a fallback
        if (!success && style === "italic") {
          console.log(`Loading fallback normal style for ${font.family}`);
          await loadFont(font, weight, "normal");
        }
      } catch (error) {
        console.error(`Failed to load font for ${side} side:`, error);
        
        // Try loading a basic variant as fallback
        try {
          await loadFont(font, 400, "normal");
        } catch (fallbackError) {
          console.error(`Failed to load fallback font for ${side} side:`, fallbackError);
        }
      } finally {
        setState((s) => ({
          ...s,
          loadingFonts: new Set(
            [...s.loadingFonts].filter((key) => key !== loadingKey),
          ),
        }));
      }
    };

    if (state.leftId) {
      loadFontsForSide(state.leftId, state.weight, state.style, "left");
    }
    if (state.rightId) {
      loadFontsForSide(state.rightId, state.weight, state.style, "right");
    }
  }, [state.leftId, state.rightId, state.weight, state.style]);

  // Helper functions
  const randomFontId = (exclude = []) => {
    const pool = state.catalog.filter((f) => !exclude.includes(f.id));
    return pool[Math.floor(Math.random() * pool.length)]?.id;
  };

  const pickWinner = (side) => {
    const winnerId = side === "left" ? state.leftId : state.rightId;
    const loserKey = side === "left" ? "rightId" : "leftId";
    const currentLoserId = state[loserKey];
    const nextId = randomFontId([winnerId, currentLoserId].filter(Boolean));

    if (nextId) {
      setState((s) => ({ ...s, [loserKey]: nextId }));
    }
  };

  const changeFont = (side, fontId) => {
    const key = side === "left" ? "leftId" : "rightId";
    setState((s) => ({
      ...s,
      [key]: fontId,
      showFontPicker: false,
      fontPickerSide: null,
    }));
  };

  const toggleFavorite = (fontId) => {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(fontId)
        ? s.favorites.filter((id) => id !== fontId)
        : [...s.favorites, fontId],
    }));
  };

  const addUploadedFont = (fontData) => {
    setState((s) => ({
      ...s,
      catalog: [...s.catalog, fontData],
      showUpload: false,
    }));
  };

  const handleFileUpload = async (files) => {
    setState((s) => ({ ...s, isUploading: true, uploadError: null }));

    try {
      const fontMetas = await processUploadedFonts(files);

      setState((s) => ({
        ...s,
        catalog: [...s.catalog, ...fontMetas],
        isUploading: false,
        showUpload: false,
      }));

      console.log(`Successfully uploaded ${fontMetas.length} font(s)`);
    } catch (error) {
      console.error("Upload failed:", error);
      setState((s) => ({
        ...s,
        uploadError: error.message,
        isUploading: false,
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const changeWeight = (weight) => {
    setState((s) => ({ ...s, weight }));
  };

  const changeStyle = (style) => {
    setState((s) => ({ ...s, style }));
  };

  // Get font data by ID
  const getFontById = (id) => state.catalog.find((f) => f.id === id);
  const leftFont = getFontById(state.leftId);
  const rightFont = getFontById(state.rightId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing in an input
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      ) {
        return;
      }

      // Don't trigger shortcuts if a modal is open (except for specific ones)
      const hasModal = state.showUpload || state.showFavorites;

      switch (e.key) {
        case "1":
          e.preventDefault();
          if (!hasModal && leftFont && rightFont) {
            pickWinner("left");
          }
          break;

        case "2":
          e.preventDefault();
          if (!hasModal && leftFont && rightFont) {
            pickWinner("right");
          }
          break;

        case "/":
          e.preventDefault();
          if (!hasModal) {
            // Open font picker or focus search if already open
            if (state.showFontPicker) {
              const searchInput = document.querySelector(".font-search-input");
              if (searchInput) {
                searchInput.focus();
              }
            } else {
              setState((s) => ({
                ...s,
                showFontPicker: true,
                fontPickerSide: "left",
              }));
            }
          }
          break;

        case "u":
        case "U":
          e.preventDefault();
          if (!hasModal) {
            setState((s) => ({ ...s, showUpload: true }));
          }
          break;

        case "f":
        case "F":
          e.preventDefault();
          if (!hasModal) {
            setState((s) => ({ ...s, showFavorites: true }));
          }
          break;

        case "Escape":
          e.preventDefault();
          // Close any open modals
          setState((s) => ({
            ...s,
            showFontPicker: false,
            fontPickerSide: null,
            showUpload: false,
            showFavorites: false,
            uploadError: null,
            fontSearch: "",
            fontCategoryFilter: "",
          }));
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.showUpload,
    state.showFavorites,
    state.showFontPicker,
    leftFont,
    rightFont,
  ]);

  // Filter fonts for font picker
  const filteredFonts = useMemo(() => {
    let filtered = state.catalog;

    // Filter by search term
    if (state.fontSearch.trim()) {
      const searchTerm = state.fontSearch.toLowerCase().trim();
      filtered = filtered.filter((font) =>
        font.family.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by category
    if (state.fontCategoryFilter) {
      filtered = filtered.filter(
        (font) => font.category === state.fontCategoryFilter,
      );
    }

    return filtered;
  }, [state.catalog, state.fontSearch, state.fontCategoryFilter]);

  return (
    <div className="app">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="sample-text-container">
          <label htmlFor="sample-text">Sample Text:</label>
          <input
            id="sample-text"
            type="text"
            value={state.sampleText}
            onChange={(e) =>
              setState((s) => ({ ...s, sampleText: e.target.value }))
            }
            placeholder="Enter sample text..."
          />
        </div>

        <div className="size-control">
          <label htmlFor="font-size">Size: {state.sizePx}px</label>
          <input
            id="font-size"
            type="range"
            min="8"
            max="128"
            value={state.sizePx}
            onChange={(e) =>
              setState((s) => ({ ...s, sizePx: parseInt(e.target.value) }))
            }
          />
        </div>

        <div className="weight-control">
          <label htmlFor="font-weight">Weight:</label>
          <select
            id="font-weight"
            value={state.weight}
            onChange={(e) => changeWeight(parseInt(e.target.value))}
          >
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
            <option value={400}>400</option>
            <option value={500}>500</option>
            <option value={600}>600</option>
            <option value={700}>700</option>
            <option value={800}>800</option>
            <option value={900}>900</option>
          </select>
        </div>

        <div className="style-control">
          <button
            className={`style-toggle ${state.style === "italic" ? "active" : ""}`}
            onClick={() => changeStyle(state.style === "italic" ? "normal" : "italic")}
            title="Toggle italic"
          >
            <em>I</em>
          </button>
        </div>

        <div className="background-control">
          <label htmlFor="background-color">Background:</label>
          <input
            id="background-color"
            type="color"
            value={state.backgroundColor}
            onChange={(e) =>
              setState((s) => ({ ...s, backgroundColor: e.target.value }))
            }
            title="Background color"
          />
        </div>

        <div className="menu-buttons">
          <button
            onClick={() =>
              setState((s) => ({ ...s, showFavorites: !s.showFavorites }))
            }
          >
            Favorites ({state.favorites.length})
          </button>
          <button
            onClick={() =>
              setState((s) => ({ ...s, showUpload: !s.showUpload }))
            }
          >
            Upload Font
          </button>
          <div
            className="keyboard-shortcuts"
            title="Keyboard shortcuts: 1=Pick Left, 2=Pick Right, /=Search, U=Upload, F=Favorites, Esc=Close"
          >
            ⌨️
          </div>
        </div>
      </div>

      {/* Main Compare Grid */}
      <div className="compare-grid">
        {/* Left Font Card */}
        <div className="font-card">
          <div className="font-card-header">
            <h3>{leftFont?.family || "No Font"}</h3>
            <span className="source-tag">{leftFont?.source}</span>
            <button
              className={`favorite-btn ${state.favorites.includes(state.leftId) ? "favorited" : ""}`}
              onClick={() => toggleFavorite(state.leftId)}
              disabled={!state.leftId}
            >
              ★
            </button>
          </div>


          <div
            className="font-preview"
            style={{
              fontFamily: leftFont?.family ? `"${leftFont.family}", Arial, sans-serif` : "Arial, sans-serif",
              fontSize: `${state.sizePx}px`,
              fontWeight: state.weight,
              fontStyle: state.style,
              backgroundColor: state.backgroundColor,
            }}
          >
            {state.sampleText}
          </div>

          <div className="font-actions">
            <button
              className="pick-winner-btn"
              onClick={() => pickWinner("left")}
              disabled={!leftFont || !rightFont}
            >
              Pick This
            </button>
            <button
              onClick={() =>
                setState((s) => ({
                  ...s,
                  showFontPicker: true,
                  fontPickerSide: "left",
                }))
              }
            >
              Change Font
            </button>
          </div>
        </div>

        {/* Right Font Card */}
        <div className="font-card">
          <div className="font-card-header">
            <h3>{rightFont?.family || "No Font"}</h3>
            <span className="source-tag">{rightFont?.source}</span>
            <button
              className={`favorite-btn ${state.favorites.includes(state.rightId) ? "favorited" : ""}`}
              onClick={() => toggleFavorite(state.rightId)}
              disabled={!state.rightId}
            >
              ★
            </button>
          </div>


          <div
            className="font-preview"
            style={{
              fontFamily: rightFont?.family ? `"${rightFont.family}", Arial, sans-serif` : "Arial, sans-serif",
              fontSize: `${state.sizePx}px`,
              fontWeight: state.weight,
              fontStyle: state.style,
              backgroundColor: state.backgroundColor,
            }}
          >
            {state.sampleText}
          </div>

          <div className="font-actions">
            <button
              className="pick-winner-btn"
              onClick={() => pickWinner("right")}
              disabled={!leftFont || !rightFont}
            >
              Pick This
            </button>
            <button
              onClick={() =>
                setState((s) => ({
                  ...s,
                  showFontPicker: true,
                  fontPickerSide: "right",
                }))
              }
            >
              Change Font
            </button>
          </div>
        </div>
      </div>

      {/* Font Picker Dialog */}
      {state.showFontPicker && (
        <div
          className="modal-overlay"
          onClick={() =>
            setState((s) => ({
              ...s,
              showFontPicker: false,
              fontPickerSide: null,
              fontSearch: "",
              fontCategoryFilter: "",
            }))
          }
        >
          <div
            className="modal-content font-picker-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Choose Font for {state.fontPickerSide} side</h2>
              <button
                className="close-btn"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    showFontPicker: false,
                    fontPickerSide: null,
                    fontSearch: "",
                    fontCategoryFilter: "",
                  }))
                }
              >
                ×
              </button>
            </div>

            <div className="font-picker-filters">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={state.fontSearch}
                  onChange={(e) =>
                    setState((s) => ({ ...s, fontSearch: e.target.value }))
                  }
                  className="font-search-input"
                />
              </div>

              <div className="category-filter">
                <select
                  value={state.fontCategoryFilter}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      fontCategoryFilter: e.target.value,
                    }))
                  }
                  className="category-select"
                >
                  {FONT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="font-list">
              {filteredFonts.length === 0 ? (
                <div className="no-fonts-message">
                  <p>No fonts found matching your criteria.</p>
                  {state.fontSearch && (
                    <button
                      onClick={() =>
                        setState((s) => ({ ...s, fontSearch: "" }))
                      }
                      className="clear-search-btn"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredFonts.map((font) => (
                  <div
                    key={font.id}
                    className="font-list-item"
                    onClick={() => {
                      changeFont(state.fontPickerSide, font.id);
                      setState((s) => ({
                        ...s,
                        fontSearch: "",
                        fontCategoryFilter: "",
                      }));
                    }}
                    style={{ fontFamily: font.family }}
                  >
                    <div className="font-info">
                      <span className="font-name">{font.family}</span>
                      <span className="font-meta">
                        <span className="font-source">({font.source})</span>
                        {font.category && (
                          <span className="font-category">{font.category}</span>
                        )}
                      </span>
                    </div>
                    <div
                      className="font-preview-text"
                      style={{ fontFamily: font.family }}
                    >
                      The quick brown fox
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="font-picker-footer">
              <p>
                {filteredFonts.length} font
                {filteredFonts.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      {state.showUpload && (
        <div
          className="modal-overlay"
          onClick={() =>
            setState((s) => ({ ...s, showUpload: false, uploadError: null }))
          }
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Font Files</h2>
              <button
                className="close-btn"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    showUpload: false,
                    uploadError: null,
                  }))
                }
                disabled={state.isUploading}
              >
                ×
              </button>
            </div>
            <div
              className={`upload-area ${state.isUploading ? "uploading" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {state.isUploading ? (
                <div className="upload-progress">
                  <p>Uploading fonts...</p>
                  <div className="spinner"></div>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📁</div>
                  <p>
                    <strong>Drag & drop font files here</strong>
                  </p>
                  <p>or</p>
                  <input
                    type="file"
                    multiple
                    accept={SUPPORTED_EXTENSIONS.join(",")}
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                    style={{ display: "none" }}
                    id="font-file-input"
                  />
                  <button
                    className="browse-btn"
                    onClick={() =>
                      document.getElementById("font-file-input").click()
                    }
                  >
                    Browse Files
                  </button>
                  <p className="supported-formats">
                    Supported formats: {SUPPORTED_EXTENSIONS.join(", ")}
                  </p>
                </>
              )}

              {state.uploadError && (
                <div className="upload-error">
                  <p>⚠️ {state.uploadError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Drawer */}
      {state.showFavorites && (
        <div
          className="modal-overlay"
          onClick={() => setState((s) => ({ ...s, showFavorites: false }))}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Favorites</h2>
              <button
                className="close-btn"
                onClick={() =>
                  setState((s) => ({ ...s, showFavorites: false }))
                }
              >
                ×
              </button>
            </div>
            <div className="favorites-list">
              {state.favorites.length === 0 ? (
                <p>
                  No favorites yet. Click the ★ on any font card to add
                  favorites.
                </p>
              ) : (
                state.favorites.map((fontId) => {
                  const font = getFontById(fontId);
                  return font ? (
                    <div
                      key={fontId}
                      className="favorite-item"
                      style={{ fontFamily: font.family }}
                    >
                      <span>{font.family}</span>
                      <div>
                        <button onClick={() => changeFont("left", fontId)}>
                          Use Left
                        </button>
                        <button onClick={() => changeFont("right", fontId)}>
                          Use Right
                        </button>
                        <button onClick={() => toggleFavorite(fontId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null;
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
