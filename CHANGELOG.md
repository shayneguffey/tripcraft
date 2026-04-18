# TripCraft Changelog

## v0.2.0 — 2026-04-18

### Unified Time Selection

Replaced all time-editing patterns across the app with a single shared `TimeSelectPopup` component (`src/components/TimeSelectPopup.js`). Every place a user sets a time — the day detail card, dining options, activity options, transportation options, and new user events — now uses the same pill-grid popup with hour (1–12), minute (:00/:15/:30/:45), and AM/PM selection. One click per choice, no dropdowns.

- Created `TimeSelectPopup` with `to12h`, `to24h`, and `formatTime12h` exports
- Replaced `<input type="time">` and custom select-based popovers in `DiningOptions`, `ActivityOptions`, and `TransportationOptions`
- Option module day-schedule buttons now open the time popup directly (schedule + set time in one flow)
- Transportation uses "Departure" / "Arrival" labels instead of "Start" / "End"
- Time edits in the day detail card and option modules write to the same Supabase columns — changes sync both directions

### Unified Drag-and-Drop

Events with and without set times can now be reordered together via drag-and-drop in the day detail card. Previously only untimed events could be reordered among themselves.

### Centralized Category Colors

Created `src/lib/categoryColors.js` — a single source of truth for all category color tokens. Every component that renders a category color now imports from this file. Changing a color once updates it across the calendar cells, day detail cards, event popups, budget charts, map pins, and option modules.

| Category | Color Family | Hex |
|----------|-------------|-----|
| Flights | Emerald | `#10b981` |
| Accommodation | Sky | `#0ea5e9` |
| Activities | Yellow | `#eab308` |
| Dining | Orange | `#f97316` |
| Transportation | Violet | `#8b5cf6` |
| User Events | Stone | `#78716c` |
| Misc/Other | Slate | `#64748b` |

Files updated: `BudgetTracker.js`, `TripMap.js`, `page.js` (3 colorMap objects + EventPopup)

### Inline Edit Layout Stability

Fixed layout shifting when clicking to edit inline fields (day titles, itinerary name, itinerary description, day notes). Display-mode elements now carry a `border border-transparent` matching the edit-mode border width, and focus rings use `ring-inset` so they don't push content. Wrapper divs use `flex items-center` with fixed `min-h` for vertical stability.

---

## v0.1.0 — Initial Release

Landing page, auth, dashboard, calendar view, inline editing, option modules (flights, activities, dining, accommodation, transportation), budget tracker, packing list, planning checklist, travel documents, trip map, collaborators. Deployed to Vercel.
