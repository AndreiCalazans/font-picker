# Font Compare

Dead‑simple single‑page React app (Vite + TS recommended, no routing). Goal: quickly compare two fonts side by side, pick a winner, and keep iterating. Keep dependencies minimal.

---

## 1) Core Features

- **Two‑up compare:** Always show **Left** and **Right** font cards with the same sample text.
- **Pick winner:** Click **Pick Left** or **Pick Right** → the non‑selected side swaps to a **random** new font from the available pool.
- **Replace either side manually:** Each card has a **Change Font** action to pick any font from the list.
- **Upload fonts:** Drag & drop or file input for `.woff2/.woff/.ttf/.otf`. Uploaded fonts join the pool immediately.
- **Font sources:**
  - Google Fonts catalog (optional API key). If no key, ship a tiny starter set or JSON snapshot.
  - Support additional providers later by dropping in metadata of `{family, files}`.

- **Bookmark fonts:** Star any font to save it to a **Favorites** list.
- **Edit sample text:** One global input drives both cards.
- **Per‑card background color:** Each card offers a BG color picker (default transparent) to test contrast.

---

## 2) UI Layout

- **Top Bar**
  - Sample Text input
  - Size slider (8–128px)
  - Menu: Favorites, Upload Font, (optional) Import/Export

- **Main** (responsive two columns)
  - **FontCard (Left)** | **FontCard (Right)**
    - Header: Font family name, source tag (Google/Uploaded)
    - Controls row: Weight dropdown (available weights), Style toggle (normal/italic), BG color picker
    - Preview area: sample text rendered
    - Actions: **Pick This**, **Change Font**, **★ Favorite**

- **Font Picker Dialog**
  - Search by name
  - Filter by category (serif, sans, display, handwriting, mono)
  - List (virtualized if >200): each row shows the family rendered in itself

---

## 3) Data Types (TS)

```ts
export type VariantMeta = { weight: number; style: "normal" | "italic" };
export type FontMeta = {
  id: string; // unique slug
  family: string; // display name
  category?: "serif" | "sans-serif" | "display" | "handwriting" | "monospace";
  variants: VariantMeta[]; // minimal variant list
  files: { [key: string]: string }; // e.g. "400": url, "400italic": url, prefer woff2
  source: "google" | "uploaded" | "bundled";
};

export type AppState = {
  catalog: FontMeta[]; // all available fonts
  leftId?: string; // current left font id
  rightId?: string; // current right font id
  leftBg: string; // css color
  rightBg: string; // css color
  sizePx: number; // preview size
  sampleText: string; // global sample text
  favorites: string[]; // font ids
};
```

**Persistence:** Store `{favorites, sampleText, sizePx, leftId, rightId, leftBg, rightBg}` in `localStorage` under `font-compare-v1`.

---

## 4) Component Tree

- `App` (state + effects)
  - `TopBar` (sample text, size slider, buttons)
  - `CompareGrid`
    - `FontCard` (props: side: 'left'|'right') ×2

  - `FontPickerDialog` (search/filter/list)
  - `UploadDialog`
  - `FavoritesDrawer`

**Minimal styling:** CSS modules or Tailwind. Keep layout simple (grid with two equal columns). Prefer system theme.

---

## 5) Actions & Flows

### Pick Winner

1. User clicks **Pick Left** or **Pick Right**.
2. Identify the **loser side**; select a random font `≠` winner and `≠` current loser font.
3. Swap loser side font to the random pick and keep winner side as‑is.

### Change Font Manually

- Opens `FontPickerDialog`; selecting a font sets that side to the chosen font.

### Upload Font

1. Accept files; for each file create `blob:` URL via `URL.createObjectURL`.
2. Parse metadata from filename (e.g., `FamilyName-700-Italic.woff2`). If unknown, default to `{weight:400, style:'normal'}` and prompt editable fields.
3. Register with `@font-face` using `FontFace` API; push into `catalog` with `source:'uploaded'`.

### Bookmark

- Toggle star on card header to add/remove `font.id` in `favorites`.

### Background Color

- Each card exposes a color input; bind to `leftBg`/`rightBg`.

---

## 6) Font Loading (on‑demand)

- Use `FontFace` API to load only the variant currently displayed (e.g., `weight 400 normal`).
- Construct a key from `{family, weight, style}`; cache loaded faces in `document.fonts` and a local `Set`.
- When a side’s weight/style changes, (lazy) load the new file and apply.

**Google Fonts Catalog**

- GOOGLE_FONT_API_KEY API key is provided in .env, fetch the catalog once and map to `FontMeta` with best `woff2` URLs.
- Otherwise, ship a tiny JSON snapshot (e.g., \~50 popular families) or rely on uploads.

---

## 7) State Helpers (pseudocode)

```ts
function randomFontId(exclude: string[] = []): string {
  const pool = state.catalog.filter((f) => !exclude.includes(f.id));
  return pool[Math.floor(Math.random() * pool.length)]?.id;
}

function pickWinner(side: "left" | "right") {
  const winnerId = side === "left" ? state.leftId! : state.rightId!;
  const loserKey = side === "left" ? "rightId" : "leftId";
  const nextId = randomFontId([winnerId, state[loserKey]!].filter(Boolean));
  setState((s) => ({ ...s, [loserKey]: nextId }));
}
```

---

## 8) Minimal Acceptance Criteria

- Can compare two fonts; picking one replaces the other with a random different font.
- Can manually change either side from a searchable list.
- Can upload a `.woff2` font and use it immediately.
- Can bookmark/unbookmark fonts and view favorites.
- Can change preview text, size, and per‑card background color.
- Catalog & preferences persist across reloads.
- No routing, no state library; Vite dev server runs clean (no console errors).

---

## 9) Nice‑to‑Haves (Optional, small)

- Weight selector per card (uses available variants if present).
- Italic toggle if the variant exists.
- Keyboard: `1` pick left, `2` pick right, `/` focus search, `u` open upload.
- Import/Export favorites as JSON.
