# TripCraft Style Guide

This document defines the visual design system for TripCraft. Every new page, component, or feature should follow these patterns to maintain a consistent look and feel. If a style needs to change, update it here first — this is the single source of truth.

---

## Design Philosophy

TripCraft's visual identity draws from **vintage WPA and Art Deco travel posters** — the kind you'd find framed in a national park lodge or a 1930s railway station. The aesthetic is warm, sophisticated, and tactile: matte poster finishes rather than glossy screens, aged parchment rather than clinical white, hand-crafted warmth rather than cold minimalism.

**Core principles:**

- **Warm over cool.** Every neutral leans toward stone, sand, and parchment — never blue-gray or pure gray.
- **Matte, not glossy.** Soft lighting, no harsh drop shadows, muted saturation. Think printed poster, not backlit LCD.
- **Subtle over loud.** Hover effects brighten gently. Status colors are earthy, not neon. Transitions are smooth and unhurried.
- **Layered depth.** Dark translucent panels with backdrop blur sit over textured backgrounds, creating a sense of physical layers — like maps and overlays on a planning table.

---

## Color Palette

### Primary Accent
| Token | Value | Use |
|-------|-------|-----|
| Terracotta | `#da7b4a` | Primary buttons, CTA, active accents, loading spinners, route view day selection, map route lines |
| Terracotta Dark | `#b5552a` | Hover state of primary buttons, icon hover accents |

### Status Colors
| Status | Value | Use |
|--------|-------|-----|
| Planning | `#4a965a` | Card border, pin color, status pill |
| Traveled | `#3c78b4` | Card border, pin color, status pill, flight arcs, checkmarks |
| Wish | `#d2aa32` | Card border, pin color, status pill |

### Parchment / Background Tones
These warm stone tones form the foundation of every page background. Never use pure white (`#fff`) or cool grays as a page base.

| Token | Value | Use |
|-------|-------|-----|
| Parchment Light | `rgba(222, 210, 190, 0.95)` | Landing page gradient top |
| Parchment Mid | `rgba(195, 178, 155, 0.98)` | Landing page gradient middle |
| Parchment Deep | `rgba(160, 140, 115, 1)` | Landing page gradient bottom |
| Dashboard Light | `rgba(210, 195, 172, 0.7)` | Dashboard gradient endpoints |
| Dashboard Mid | `rgba(222, 210, 190, 0.6)` | Dashboard gradient center |
| Cream Glow | `rgba(235, 225, 210, 0.88)` | Radial glow behind logo/hero |
| Card Info | `#EEEEEE` | Trip card info bar background |

### Dark UI Panels (Globe & Overlay)
Used for floating UI elements that sit over the globe or dark backgrounds. Always pair with `backdrop-filter: blur(8px)`.

| Token | Value | Use |
|-------|-------|-----|
| Panel Dark | `rgba(30, 22, 12, 0.75)` | Legend, country count, flight toggle, country list |
| Panel Border | `rgba(212, 165, 116, 0.2)` | Subtle warm gold border on dark panels |
| Panel Border Strong | `rgba(212, 165, 116, 0.5)` | Checkbox borders, interactive element borders |

### Map Pattern Colors
| Token | Value | Use |
|-------|-------|-----|
| Map Line | `#b8a48a` | Latitude/longitude grid lines, coast outlines |
| Map Accent | `#c9a87c` | Compass rose, route dots, decorative elements |

### Category Colors (Centralized)

All event/option category colors are defined in **`src/lib/categoryColors.js`** — this is the single source of truth. Never hardcode a category color in a component; always import from this file.

Each category provides a full set of tokens: `hex`, `hexLight`, `bg`, `bgMedium`, `border`, `text`, `textDark`, `dot`, `bar`, `pill`, and `chart`. These are used across the calendar, day detail cards, option modules, budget charts, map pins, and event popups.

| Category | Family | Hex (primary) | Tailwind base | Used for |
|----------|--------|---------------|---------------|----------|
| Flights | Emerald | `#10b981` | `emerald-*` | Flight events, budget row, map pins |
| Accommodation | Sky | `#0ea5e9` | `sky-*` | Stay events, budget row, map pins |
| Activities | Yellow | `#eab308` | `yellow-*` | Activity events, budget row, map pins |
| Dining | Orange | `#f97316` | `orange-*` | Dining events, budget row, map pins |
| Transportation | Violet | `#8b5cf6` | `violet-*` | Transport events, budget row, map pins |
| User Events | Stone | `#78716c` | `stone-*` | Manually created day events |
| Misc/Other | Slate | `#64748b` | `slate-*` | Budget "other expenses" catch-all |

**To change a category color:** edit the entry in `src/lib/categoryColors.js`. The change propagates everywhere automatically — no need to update individual components.

**Sub-category colors** (cuisine types, activity types, transport types, accommodation types) remain local to their respective option modules. These are visual accents within a module's detail panel and do not need global coordination.

### Text Colors
| Context | Value |
|---------|-------|
| Primary text (light bg) | `#171717` or Tailwind `text-stone-800` |
| Secondary text (light bg) | `text-stone-600`, `text-stone-500` |
| Muted text (light bg) | `text-stone-400` |
| Primary text (dark bg) | `text-white/90` |
| Secondary text (dark bg) | `text-white/80` |
| Label text (dark bg) | `text-white/50`, `text-white/70` |
| Dimmed text (dark bg) | `text-white/40` |
| Brown accent text | `rgba(80, 65, 50, 0.95)` active, `rgba(80, 65, 50, 0.55)` inactive |

---

## Typography

### Font Stack
| Role | Font | Variable | Fallback |
|------|------|----------|----------|
| Sans-serif (default) | Geist | `--font-geist-sans` | Arial, Helvetica, sans-serif |
| Serif (decorative) | Playfair Display | `--font-playfair` | Georgia, serif |
| Monospace | Geist Mono | `--font-geist-mono` | monospace |

Playfair Display is loaded with weights 400–700 and italic. Use it sparingly for headings or decorative elements that reinforce the vintage poster feel. Body text and UI should use Geist (the default).

### Scale
| Size | Tailwind | Use |
|------|----------|-----|
| 3xl | `text-3xl` | Page headers, form titles |
| 2xl | `text-2xl` | Large counters (country count number) |
| xl | `text-xl` | Trip card titles, section headers |
| lg | `text-lg` | Auth buttons, CTA text |
| base | `text-base` | Body text, form inputs |
| sm | `text-sm` | Secondary text, small buttons, labels |
| xs | `text-xs` | Destination labels, legend items, metadata |
| 10px | `text-[10px]` | Calendar labels, date annotations, UI micro-labels |
| 9px | `text-[9px]` | Status pills |

### Weight
| Weight | Tailwind | Use |
|--------|----------|-----|
| Bold | `font-bold` | Card titles, counters, headers |
| Semibold | `font-semibold` | Buttons, form labels, CTA |
| Medium | `font-medium` | Secondary headings, input labels, legend items |
| Regular | (default) | Body text |

### Extras
- `tracking-wide` on labels, CTA text, and loading indicators
- `uppercase` on small UI labels (status legend, micro-labels in dark panels)

---

## Backgrounds & Textures

### Page Gradients

**All pages** — linear vertical parchment:
```css
linear-gradient(to bottom,
  rgba(210,195,172,0.7) 0%,
  rgba(222,210,190,0.6) 50%,
  rgba(210,195,172,0.7) 100%)
```
This gradient is used consistently across the landing page, dashboard, loading screen, and all subpages.

### Map Pattern Overlay
A tiled SVG cartography pattern (`MapPatternBg` component) sits behind content on every page. Default configuration: 280px tile size, opacity `0.38`, colors `#b8a48a` / `#c9a87c`. The pattern includes latitude/longitude grid lines, coastline contours, compass rose, and dotted travel route arcs.

### Backdrop Blur
Dark floating panels always pair their semi-transparent background with backdrop blur:
- `backdrop-filter: blur(8px)` — standard for globe UI panels
- `backdrop-filter: blur(4px)` — lighter use on forms/overlays
- Tailwind `backdrop-blur-sm` — minimal blur on buttons/pills

### Image Filters (Poster Aging Effect)
Trip card cover images get a subtle vintage treatment via CSS filters:

**Default state:**
```css
filter: sepia(0.15) saturate(1.1) contrast(1.02) brightness(1.08) hue-rotate(-3deg);
```

**Hover state (slightly more vivid):**
```css
filter: sepia(0.08) saturate(1.18) contrast(1.05) brightness(1.12) hue-rotate(-2deg);
```

**Faded background images** (New Trip card):
```css
filter: brightness(1.55) saturate(0.35) contrast(0.8);
```
Use CSS filter rather than opacity when you want to fade an image without revealing what's behind it.

---

## Borders & Radius

### Border Radius Scale
| Size | Tailwind | Use |
|------|----------|-----|
| Full circle | `rounded-full` | Pills, avatar buttons, circular icons |
| 2xl | `rounded-2xl` | Trip cards, large modals |
| xl | `rounded-xl` | Globe UI panels, medium containers |
| lg | `rounded-lg` | Buttons, inputs, small cards |

### Border Styles
- **Trip card status border:** `border-bottom: 8px solid [status-color]` — the signature visual. Status color transitions over `0.4s`.
- **Dark panel borders:** `1px solid rgba(212, 165, 116, 0.2)` — warm gold, barely visible.
- **Form input borders:** `border border-stone-300` with `focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent`.
- **Dividers on light backgrounds:** `border-stone-200` or `border-slate-200`.
- **Dividers on dark backgrounds:** `border-white/30` or `rgba(212, 165, 116, 0.15)`.

### Shadows
- **Default cards/panels:** `shadow-sm`
- **Hover / elevated:** `shadow-xl`
- No custom `box-shadow` values — stick to Tailwind utilities.

---

## Spacing & Layout

### Grid
The trip card grid is the primary layout pattern:
```
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6
```

### Max Widths
| Container | Value |
|-----------|-------|
| Dashboard content | `max-w-6xl mx-auto` |
| Form pages | `max-w-5xl` |
| Auth panel / New trip form | `max-w-xl` |

### Common Padding
| Context | Value |
|---------|-------|
| Page horizontal | `px-6` or `px-8` |
| Card info section | `px-4 py-3` |
| Buttons (large) | `px-10 py-2.5` |
| Buttons (small) | `px-4 py-1.5` |
| Form inputs | `px-3 py-2.5` |
| Dark UI panels | `px-4 py-3` or `px-4 py-2.5` |

### Z-Index Layers
| Layer | Z-Index | Use |
|-------|---------|-----|
| Base content | 0–10 | Cards, map pattern |
| Header/nav | 10–20 | Top bar, view toggles |
| Floating panels | 20–30 | Globe legend, tooltips |
| Modals/dropdowns | 30–40 | Country list, account menu |
| Top overlay | 40+ | Backdrop click-catchers |

---

## Component Patterns

### Trip Cards
- Aspect ratio: `aspect-[3/4]` (portrait)
- Cover image fills card with `bg-cover bg-center`, positioned `center 20%` (slight top bias)
- Bottom info bar: `#EEEEEE` background with gradient fade (`linear-gradient(to top, #EEEEEE 0%, transparent 100%)`)
- Status border: `8px solid [status-color]` on bottom edge
- Hover: scale image to `1.05` over `0.5s`, elevate shadow to `shadow-xl` over `0.3s`
- Regenerate button: appears on hover, positioned bottom-right of image area

### Status Pills
- Size: `w-[4.2rem] py-[2-3px] rounded-full text-[9px] font-semibold`
- Active pill: stronger background opacity, bolder text
- Inactive pill: faded, `backdrop-blur-sm`

### Dark UI Panels (Globe View)
All floating UI in the globe view follows this pattern:
```jsx
<div
  className="px-4 py-3 rounded-xl"
  style={{
    background: "rgba(30, 22, 12, 0.75)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(212, 165, 116, 0.2)",
  }}
>
```
Interactive panels add: `cursor-pointer hover:brightness-110 transition-all`

### Buttons
**Primary CTA:**
```jsx
className="bg-[#da7b4a] text-white py-2.5 px-10 rounded-lg font-semibold tracking-wide
           hover:ring-2 hover:ring-white transition-all"
```

**Secondary / Google auth:**
```jsx
className="bg-white/90 border border-stone-300 text-stone-700 py-2.5 rounded-lg"
```

### Form Inputs
```jsx
className="px-3 py-2.5 border border-stone-300 text-stone-800 rounded-lg
           focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
```

### Modals & Popups
- Background: `bg-white rounded-xl shadow-xl border border-stone-200`
- Overlay click-to-close: `fixed inset-0` with z-index one layer below the modal
- Entry animation: `cardFadeIn` — opacity 0→1, scale 0.95→1, translateY 10px→0

---

## Animations & Transitions

### Duration Scale
| Speed | Duration | Use |
|-------|----------|-----|
| Instant | `0.2s` | Button feedback, color changes |
| Standard | `0.3s` | Card hover shadow, most UI transitions |
| Comfortable | `0.4s` | Status color change, image filter shift |
| Slow | `0.5s` | Card image scale on hover |
| Dramatic | `0.7s` | Globe view toggle |
| Crossfade | `1.5s` | New trip card background image cycling |

### Easing
Default to `ease-in-out` for most transitions. Use Tailwind's `transition-all` for convenience, or `transition-colors`, `transition-shadow` when you want to be specific.

### Hover Effects
- Cards: `hover:shadow-xl` + image `scale(1.05)`
- Buttons: `hover:ring-2 hover:ring-white` or `hover:bg-[variant]`
- Dark panels: `hover:brightness-110`
- Icons/links: subtle color shift toward terracotta (`hover:text-[#b5552a]`)

### Loading States
- Spinner: `w-8 h-8 border-3 border-stone-400 border-t-[#da7b4a] rounded-full animate-spin`
- Generating indicator: overlay text with disabled state (`opacity-50 cursor-not-allowed`)
- Flight path loader: decorative dotted route animation on page load

---

## Globe-Specific Design

### Texture
The globe uses a custom posterized equirectangular projection texture (`/public/globe posterized lores.png`) with flat, discrete color regions that match the WPA poster aesthetic. No photorealistic satellite imagery.

### Lighting
Warm, directional lighting that evokes matte poster finish:
- Ambient: `0xfff5e8` (warm white)
- Key light: `0xfff0e0` (cream white), intensity 0.9
- Fill light: `0xe8dcc8` (warm beige), intensity 0.3
- No harsh specular highlights: `shininess: 5`, `specular: 0x222222`

### Atmosphere
Subtle glow ring around the globe: color `0xd4c5a8` (warm tan), opacity `0.12`.

### Pins
- Size: `SphereGeometry(0.012)` with invisible hitbox `SphereGeometry(0.04)`
- Color: matches status color of the trip
- Labels: canvas-rendered text sprites, visible on hover only

### Flight Arcs
- Color: `#3c78b4` (traveled blue), 50% opacity
- Tube radius: `0.003`
- Arc height scales with distance: `1.0 + min(distance × 0.35, 0.4)`
- Toggleable via Flight Paths checkbox

### Camera
- Zoom range: `1.5` (close) to `6` (far), default `3`
- Auto-rotation: `globe.rotation.y += 0.0002` per frame (pauses during interaction)

---

## Detail Pane Labels

All uppercase field labels in option detail panels (e.g. "Address", "Duration", "Notes", "Add to itinerary") use a shared style token defined in **`src/lib/detailPaneStyles.js`**. Import `LABEL`, `LABEL_MB1`, or `LABEL_MB2` from this file — never hardcode label styles in individual components.

| Token | Classes | Use |
|-------|---------|-----|
| `LABEL` | `text-xs text-slate-400 uppercase tracking-wide` | Inline field labels (span inside a stat row) |
| `LABEL_MB1` | `LABEL` + `mb-1` | Section heading with small bottom margin |
| `LABEL_MB2` | `LABEL` + `mb-2` | Section heading with larger bottom margin |

To change every label across all modules, edit the token values in `detailPaneStyles.js`.

---

## Route View Accent

The map route view uses **Terracotta (`#da7b4a`)** as the universal accent color for selected day highlights, route lines, numbered step pins, and the "All Days" button. Do not use per-day color cycling — all days share the same accent to maintain visual consistency with the rest of the app.

---

## Do's and Don'ts

**Do:**
- Use the parchment gradient as the base for every page
- Apply the vintage image filter to any user-uploaded or AI-generated travel imagery
- Keep transitions smooth and unhurried (0.3–0.5s standard)
- Use dark translucent panels with backdrop blur for any floating UI over complex backgrounds
- Match the warm gold border (`rgba(212, 165, 116, 0.2)`) on dark panels

**Don't:**
- Use pure white (`#ffffff`) as a page background
- Use cool grays (`gray-*`, `slate-*`) for backgrounds — always lean warm (`stone-*`)
- Add harsh drop shadows or strong glows
- Use neon or high-saturation colors for status/accent — keep them earthy
- Make transitions faster than `0.2s` — the vibe is relaxed, not snappy
- Use opacity to fade images when the background behind them would bleed through — use CSS `filter: brightness() saturate()` instead
