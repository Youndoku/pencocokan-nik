# Brand Color Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every Tailwind default-palette brand/semantic color (`indigo-*`, `emerald-*`, `amber-*`, `red-*`, `blue-*`, `purple-*`) across the app with the official Kota Batu/Diskominfo brand tokens, keeping `slate-*` neutrals untouched.

**Architecture:** Add the brand palette as Tailwind v4 `@theme` CSS custom properties in `src/index.css` (Task 1) — this makes `bg-primary`, `text-accent-red`, etc. valid utility classes app-wide with zero other setup. Every other task is a mechanical find-and-replace of specific Tailwind color tokens in specific files, following one deterministic substitution table (below). Two files (`ResultsDashboard.jsx`, `SummaryPanel.jsx`) also get a second, separate task touching different lines (hardcoded hex color constants for charts) — that overlap is intentional, the two concerns (chart hex constants vs. Tailwind utility classes) are unrelated code and reviewed separately.

**Tech Stack:** React 19, Tailwind v4 (`@tailwindcss/vite`, CSS-native `@theme`, no JS config file), Recharts (chart hex colors passed as JS strings, not Tailwind classes).

**Spec:** `docs/superpowers/specs/2026-09-03-brand-color-rebrand-design.md`

## Global Constraints

- `slate-*` classes are NEVER touched by this plan — every task's file list explicitly excludes them. If you see `slate-*` in a file you're editing, leave it exactly as-is.
- No dark mode exists in this app (single fixed light theme) — don't add `dark:` variants.
- `accent-gold` (`#DBEC20`) is never used as a text color directly — see the amber substitution rules below (icon vs. body-text split).
- After every task's edits, run `npm run lint` and `npm run build` — both must be clean (same warning count as the pre-existing baseline; this repo has no automated test suite, so lint+build is the verification gate per its established convention).
- Every color-class value below is copied verbatim from `docs/superpowers/specs/2026-09-03-brand-color-rebrand-design.md`.

### The substitution table (applies to every task below)

Where a class in a file matches the left column, replace it with the right column. The Tailwind prefix/suffix around the color token (`bg-`, `text-`, `border-`, `ring-`, `hover:`, `focus:`, `shadow-`, opacity suffix like `/30`, `/10`) is always preserved — only the color-family+shade part changes.

**Indigo → primary family:**
| Old shade | New token |
|---|---|
| `indigo-50`, `indigo-100`, `indigo-200`, `indigo-300` | `primary-light` |
| `indigo-400`, `indigo-500`, `indigo-600` | `primary` |
| `indigo-700`, `indigo-900` | `primary-dark` |

**Emerald → primary family** (Design.md semantic mapping: Success = primary):
| Old shade | New token |
|---|---|
| `emerald-50`, `emerald-100`, `emerald-200`, `emerald-300` | `primary-light` |
| `emerald-500`, `emerald-600` | `primary` |
| `emerald-700` | `primary-dark` |

**Amber → accent-gold** (Design.md: Warning = accent-gold, but accent-gold has no `-light`/`-dark` variant and fails WCAG as a text color — "use darker text on top"):
| Old class | New class | Note |
|---|---|---|
| `bg-amber-50`, `bg-amber-100` | `bg-accent-gold/15` | opacity modifier — no light variant exists |
| `border-amber-200`, `border-amber-300` | `border-accent-gold/40` | |
| `text-amber-500`, `text-amber-600` **on a lucide-react icon** | `text-accent-gold` | Design.md explicitly allows gold for icons |
| `text-amber-700`, `text-amber-800`, `text-amber-900` **on body/label/heading text** (not an icon) | `text-neutral-900` | gold fails as text color per Design.md |

**Red → accent-red** (Semantic: Error = accent-red; no contrast warning given, safe as direct text/icon color):
| Old class | New class |
|---|---|
| `bg-red-50`, `hover:bg-red-50`, `hover:bg-red-100` | `bg-accent-red/10` / `hover:bg-accent-red/15` |
| `border-red-200` | `border-accent-red/30` |
| `text-red-400`, `text-red-500`, `text-red-600`, `text-red-700`, `hover:text-red-600` | `text-accent-red` / `hover:text-accent-red` |

**Blue → accent-sky** (Semantic: Info = accent-sky):
| Old class | New class |
|---|---|
| `text-blue-500` | `text-accent-sky` |
| `bg-blue-50` | `bg-accent-sky/10` |
| `border-blue-200` | `border-accent-sky/30` |

**Purple → secondary** (only appears in one 2-stop gradient with indigo, `ResultsDashboard.jsx`):
| Old class | New class |
|---|---|
| `to-purple-500` | `to-secondary` |
| `hover:to-purple-600` | `hover:to-secondary-dark` |

---

## Task 1: Add brand color tokens to `src/index.css`

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: Tailwind utility classes `bg-primary`, `text-primary-dark`, `border-primary-light`, `bg-secondary`, `text-secondary-dark`, `border-secondary-light`, `bg-accent-sky`, `bg-accent-gold`, `bg-accent-red`, `text-accent-sky`, `text-accent-gold`, `text-accent-red`, `border-accent-sky`, `border-accent-gold`, `border-accent-red`, `bg-neutral-900`, `text-neutral-900`, `bg-neutral-100`, `bg-neutral-white`, `bg-neutral-400` (and all Tailwind opacity-modifier variants of the above, e.g. `bg-accent-red/10`) — every later task consumes these.

- [ ] **Step 1: Add the `@theme` color tokens**

The file currently starts with:

```css
@import "tailwindcss";

/* ── Theme ── */
/* Font sistem bawaan (bukan Google Fonts) — aplikasi ini 100% offline,
   tanpa request jaringan apa pun, termasuk untuk font. */
@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    sans-serif;
}
```

Replace that `@theme` block with:

```css
@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    sans-serif;

  /* Palet resmi Kota Batu / Diskominfo — lihat
     docs/superpowers/specs/2026-09-03-brand-color-rebrand-design.md */
  --color-primary: #0DA44F;
  --color-primary-dark: #0B7A3B;
  --color-primary-light: #C0D8CC;

  --color-secondary: #4454AA;
  --color-secondary-dark: #3A4164;
  --color-secondary-light: #DCE1F1;

  --color-accent-sky: #09ABE7;
  --color-accent-gold: #DBEC20;
  --color-accent-red: #D91F2B;

  --color-neutral-900: #191D1C;
  --color-neutral-100: #F4F4F4;
  --color-neutral-white: #FFFFFF;
  --color-neutral-400: #B0B0B0;
}
```

Everything else in the file (keyframes, `@utility animate-*`) stays untouched.

- [ ] **Step 2: Verify the tokens compile**

Run: `npm run build`
Expected: build succeeds with no CSS errors. (The new classes aren't used anywhere yet, so nothing renders differently — this step just confirms Tailwind accepted the `@theme` syntax.)

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add Kota Batu/Diskominfo brand color tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Rebrand chart & status hex color constants

These 6 files hardcode hex strings in JS (not Tailwind classes) for chart series or inline `style={{backgroundColor}}` — Tailwind's `@theme` tokens don't apply here, use the literal hex values.

**Files:**
- Modify: `src/components/pencocokan/ResultsDashboard.jsx:22-24` (the `COLORS` object only — leave the rest of the file for Task 7)
- Modify: `src/components/dashboard/SummaryPanel.jsx:10` (the `COLORS` array only — leave line 30's badge classes for Task 5)
- Modify: `src/components/dashboard/DistributionChart.jsx:12-19` (`CHART_COLORS` array)
- Modify: `src/components/dashboard/ProgramComparisonChart.jsx:6` (`BAR_COLORS` array)
- Modify: `src/components/dashboard/CrossProgramMatrix.jsx:56` (the `rgba(...)` intensity fill)
- Modify: `src/components/riwayat/SessionCard.jsx:88-94` (the progress-bar color ternary only — leave the rest of the file for Task 4)

**Interfaces:**
- Consumes: nothing from other tasks (pure hex literals).
- Produces: no new exports — these are internal constants each file already uses the same way.

- [ ] **Step 1: `ResultsDashboard.jsx` — status-pinned pie colors**

Find:
```js
const COLORS = {
  cocok: "#10b981",
  tidak: "#ef4444",
  dikecualikan: "#f59e0b",
};
```
Replace with:
```js
const COLORS = {
  cocok: "#0DA44F",       // primary — Semantic: Success
  tidak: "#D91F2B",       // accent-red — Semantic: Error
  dikecualikan: "#DBEC20", // accent-gold — Semantic: Warning
};
```

- [ ] **Step 2: `SummaryPanel.jsx` — same status colors, array form**

The array is index-matched to `pieData = [Cocok, TidakCocok, ...Dikecualikan?]` (see `pieData` a few lines below it — don't reorder).

Find:
```js
const COLORS = ["#10b981", "#ef4444", "#f59e0b"];
```
Replace with:
```js
const COLORS = ["#0DA44F", "#D91F2B", "#DBEC20"]; // primary, accent-red, accent-gold
```

- [ ] **Step 3: `DistributionChart.jsx` — open categorical rotation**

This chart draws one bar per distinct `Keterangan` category (an open-ended count, could be 2 or 6). Use the dataviz-skill-validated 5-color categorical order from the spec (NOT Design.md's original 7-color order, which failed CVD/contrast validation — see spec's "Chart & diagram — temuan validasi" section). The existing code cycles the array with `CHART_COLORS[i % CHART_COLORS.length]`, so 5 entries is fine even if there end up being more than 5 categories.

Find:
```js
const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];
```
Replace with:
```js
const CHART_COLORS = [
  "#0DA44F", // primary
  "#4454AA", // secondary
  "#D91F2B", // accent-red
  "#09ABE7", // accent-sky
  "#0B7A3B", // primary-dark
];
```

- [ ] **Step 4: `ProgramComparisonChart.jsx` — same validated 5-color rotation**

Find:
```js
const BAR_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
```
Replace with:
```js
const BAR_COLORS = ["#0DA44F", "#4454AA", "#D91F2B", "#09ABE7", "#0B7A3B"]; // primary, secondary, accent-red, accent-sky, primary-dark — dataviz-validated order
```

- [ ] **Step 5: `CrossProgramMatrix.jsx` — intensity heatmap fill**

The matrix cells use `rgba(99, 102, 241, intensity)` (indigo-500 in RGB) to shade by overlap count. Replace the RGB triple with `primary`'s RGB (`13, 164, 79`), keeping the `intensity` variable and everything else on the line untouched.

Find:
```js
                          : `rgba(99, 102, 241, ${intensity * 0.3})`,
```
Replace with:
```js
                          : `rgba(13, 164, 79, ${intensity * 0.3})`,
```

- [ ] **Step 6: `SessionCard.jsx` — progress-bar fill by percentage**

Find:
```js
                  backgroundColor:
                    persen >= 70
                      ? "#10b981"
                      : persen >= 40
                        ? "#f59e0b"
                        : "#ef4444",
```
Replace with:
```js
                  backgroundColor:
                    persen >= 70
                      ? "#0DA44F"
                      : persen >= 40
                        ? "#DBEC20"
                        : "#D91F2B",
```

- [ ] **Step 7: Verify**

Run: `npm run lint && npm run build`
Expected: both clean, no new warnings vs. the pre-existing baseline (run `npm run lint` on `master` before this task if you need to compare — the baseline has pre-existing unused-var warnings unrelated to this change; don't fix those, just confirm this task didn't add new ones).

- [ ] **Step 8: Commit**

```bash
git add src/components/pencocokan/ResultsDashboard.jsx src/components/dashboard/SummaryPanel.jsx src/components/dashboard/DistributionChart.jsx src/components/dashboard/ProgramComparisonChart.jsx src/components/dashboard/CrossProgramMatrix.jsx src/components/riwayat/SessionCard.jsx
git commit -m "feat: rebrand chart hex color constants to brand palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Rebrand Layout & Shell (App.jsx, Sidebar.jsx, DashboardHome.jsx)

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/layout/Sidebar.jsx`
- Modify: `src/pages/DashboardHome.jsx`

**Interfaces:**
- Consumes: `bg-primary`, `text-primary`, `bg-primary-light`, `text-primary-dark`, etc. from Task 1's `@theme` tokens.

- [ ] **Step 1: `App.jsx`**

One occurrence — the outer gradient background.

Find (inside the `className` on the root `<div>`):
```
from-slate-50 via-white to-indigo-50/30
```
Replace with:
```
from-slate-50 via-white to-primary-light/30
```
(`slate-50`/`white` stay — only the `indigo-50` stop changes, per the substitution table.)

- [ ] **Step 2: `Sidebar.jsx` — apply the substitution table to every `indigo-*` occurrence**

There are 3 near-identical logo blocks (mobile top bar, mobile drawer, desktop sidebar) and the nav-item active/badge styling. Every one of these needs the same class-level swap — use the global substitution table:

| Line(s) | Old | New |
|---|---|---|
| 39, 124 | `hover:text-indigo-600` | `hover:text-primary` |
| 41, 71, 127 | `from-indigo-500 to-indigo-600` | `from-primary to-primary` (both stops become the same token — it was already a same-hue gradient, just two adjacent shades; primary alone is fine as a solid-looking fill) |
| 93, 155 | `bg-indigo-50 text-indigo-700` | `bg-primary-light text-primary-dark` |
| 100, 169 | `bg-indigo-600` | `bg-primary` |
| 162 | `bg-indigo-600` | `bg-primary` |

Apply each row everywhere that exact old string occurs in the file (some rows list two line numbers because the mobile-drawer and desktop-sidebar blocks repeat the same className).

- [ ] **Step 3: `DashboardHome.jsx`**

Find:
```
text-indigo-400
```
Replace with:
```
text-primary
```

Find:
```
bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700
```
Replace with:
```
bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/layout/Sidebar.jsx src/pages/DashboardHome.jsx
git commit -m "feat: rebrand layout shell (App, Sidebar, DashboardHome) to brand palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Rebrand Riwayat components

**Files:**
- Modify: `src/pages/RiwayatPage.jsx`
- Modify: `src/components/riwayat/SessionCard.jsx` (Tailwind classes only — the hex progress-bar colors were already done in Task 2, don't touch those lines again)
- Modify: `src/components/riwayat/NikSearchBox.jsx`

**Interfaces:**
- Consumes: brand tokens from Task 1.

- [ ] **Step 1: `RiwayatPage.jsx`**

| Old | New |
|---|---|
| `text-indigo-400` (loading spinner) | `text-primary` |
| `bg-indigo-100` ... `text-indigo-600` (header icon circle) | `bg-primary-light` ... `text-primary-dark` |
| `bg-indigo-600 text-white ... hover:bg-indigo-700` (empty-state CTA button) | `bg-primary text-white ... hover:bg-primary-dark` |
| `focus:ring-indigo-200 focus:border-indigo-300` (search input) | `focus:ring-primary-light focus:border-primary-light` |
| `bg-red-50 text-red-600 border border-red-200 ... hover:bg-red-100` (bulk-delete button) | `bg-accent-red/10 text-accent-red border border-accent-red/30 ... hover:bg-accent-red/15` |

- [ ] **Step 2: `SessionCard.jsx` — Tailwind classes (not the hex from Task 2)**

| Old | New |
|---|---|
| `border-indigo-300 bg-indigo-50/30 ring-2 ring-indigo-200` (selected card state) | `border-primary-light bg-primary-light/30 ring-2 ring-primary-light` |
| `text-indigo-600 focus:ring-indigo-500` (checkbox) | `text-primary focus:ring-primary` |
| `text-indigo-400` (ArrowRightLeft icon) | `text-primary` |
| `bg-indigo-50 text-indigo-700 ... hover:bg-indigo-100` (Dashboard button) | `bg-primary-light text-primary-dark ... hover:bg-primary-light/70` |
| `text-emerald-600` (cocok count) | `text-primary` |
| `text-red-500` (tidak count) | `text-accent-red` |
| `text-red-400 hover:bg-red-50 hover:text-red-600` (delete button) | `text-accent-red hover:bg-accent-red/10 hover:text-accent-red` |

- [ ] **Step 3: `NikSearchBox.jsx`**

| Old | New |
|---|---|
| `text-indigo-500` (UserCheck icon) | `text-primary` |
| `focus:ring-indigo-200 focus:border-indigo-300` (search input) | `focus:ring-primary-light focus:border-primary-light` |
| `bg-emerald-50 text-emerald-600` (Cocok badge) | `bg-primary-light text-primary-dark` |
| `bg-red-50 text-red-500` (Tidak badge) | `bg-accent-red/10 text-accent-red` |

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/pages/RiwayatPage.jsx src/components/riwayat/SessionCard.jsx src/components/riwayat/NikSearchBox.jsx
git commit -m "feat: rebrand Riwayat components to brand palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Rebrand Dashboard components

**Files:**
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/components/dashboard/AnomalyReview.jsx`
- Modify: `src/components/dashboard/DataTable.jsx`
- Modify: `src/components/dashboard/DuplicateRecipients.jsx`
- Modify: `src/components/dashboard/ExportPanel.jsx`
- Modify: `src/components/dashboard/SummaryPanel.jsx` (Tailwind badge only — the hex `COLORS` array was already done in Task 2, don't touch that line again)
- Modify: `src/components/ui/MetricCard.jsx`

**Interfaces:**
- Consumes: brand tokens from Task 1.

- [ ] **Step 1: `DashboardPage.jsx`**

| Old | New |
|---|---|
| `text-indigo-400` (loading spinner) | `text-primary` |
| `text-indigo-600 hover:text-indigo-700` ("Kembali ke Riwayat" link) | `text-primary hover:text-primary-dark` |

- [ ] **Step 2: `AnomalyReview.jsx`**

There are 3 tab buttons (Perbedaan Nama / NIK Tidak Valid / NIK Duplikat) each with the identical active-state string — apply to all 3 occurrences (lines 100, 115, 130):

| Old | New |
|---|---|
| `border-indigo-600 text-indigo-600 font-bold` (×3, tab active state) | `border-primary text-primary font-bold` |
| `focus:ring-indigo-100 focus:border-indigo-400` (search input) | `focus:ring-primary-light focus:border-primary` |
| `text-amber-500` (ShieldAlert icon, line 89) | `text-accent-gold` |
| `text-amber-700` (×3: "Masalah" header line 209, cell line 222, jumlah line 255 — all table TEXT, not icons) | `text-neutral-900` |

- [ ] **Step 3: `DataTable.jsx`**

| Old | New |
|---|---|
| `focus:ring-indigo-200` (search input, line 113) | `focus:ring-primary-light` |
| `bg-indigo-600 text-white` (active quick-filter button, line 132) | `bg-primary text-white` |
| `text-indigo-500` (ArrowUpDown sort icon, line 164) | `text-primary` |
| `text-emerald-600 font-bold` (cocok cell, line 191) | `text-primary font-bold` |
| `text-red-500 font-bold` (tidak cell, line 192) | `text-accent-red font-bold` |

- [ ] **Step 4: `DuplicateRecipients.jsx`**

| Old | New |
|---|---|
| `text-amber-500` (Users icon, line 28) | `text-accent-gold` |
| `bg-amber-50 text-amber-700` (badge, line 30) | `bg-accent-gold/15 text-neutral-900` |
| `focus:ring-indigo-200` (search input, line 50) | `focus:ring-primary-light` |
| `bg-emerald-100 text-emerald-700` (count badge, line 93) | `bg-primary-light text-primary-dark` |
| `bg-amber-100 text-amber-700` (count badge, line 102) | `bg-accent-gold/25 text-neutral-900` |

- [ ] **Step 5: `ExportPanel.jsx`**

| Old | New |
|---|---|
| `bg-emerald-50 text-emerald-700 border border-emerald-200 ... hover:bg-emerald-100` (Excel button) | `bg-primary-light text-primary-dark border border-primary-light ... hover:bg-primary-light/70` |

- [ ] **Step 6: `SummaryPanel.jsx` — the one remaining Tailwind class (not the hex array from Task 2)**

Find:
```
bg-indigo-50 text-indigo-600
```
Replace with:
```
bg-primary-light text-primary-dark
```

- [ ] **Step 7: `MetricCard.jsx` — the `tone` → className lookup used by SummaryPanel's metric cards**

Find:
```js
  const toneClasses = {
    neutral: "bg-slate-50 text-slate-900 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };
```
Replace with:
```js
  const toneClasses = {
    neutral: "bg-slate-50 text-slate-900 border-slate-200",
    success: "bg-primary-light text-primary-dark border-primary-light",
    danger: "bg-accent-red/10 text-accent-red border-accent-red/30",
    warning: "bg-accent-gold/15 text-neutral-900 border-accent-gold/40",
  };
```
(`neutral` stays untouched — it's `slate-*`.)

- [ ] **Step 8: Verify**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add src/pages/DashboardPage.jsx src/components/dashboard/AnomalyReview.jsx src/components/dashboard/DataTable.jsx src/components/dashboard/DuplicateRecipients.jsx src/components/dashboard/ExportPanel.jsx src/components/dashboard/SummaryPanel.jsx src/components/ui/MetricCard.jsx
git commit -m "feat: rebrand Dashboard components to brand palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Rebrand Pencocokan wizard step components

**Files:**
- Modify: `src/components/pencocokan/ConfigureStep.jsx`
- Modify: `src/components/pencocokan/ColumnSelect.jsx`
- Modify: `src/components/pencocokan/DataPreview.jsx`
- Modify: `src/components/pencocokan/StepDot.jsx`
- Modify: `src/components/pencocokan/UploadStep.jsx`
- Modify: `src/components/pencocokan/UploadSlot.jsx`
- Modify: `src/components/pencocokan/ValidationReport.jsx`

**Interfaces:**
- Consumes: brand tokens from Task 1.

- [ ] **Step 1: `ConfigureStep.jsx`**

| Old | New |
|---|---|
| `text-indigo-600` (Loader2, line 35) | `text-primary` |
| `bg-indigo-600` (progress bar fill, line 46) | `bg-primary` |
| `text-indigo-500` (Settings2 icon, line 61) | `text-primary` |
| `text-indigo-600 focus:ring-indigo-200` (checkbox, line 122) | `text-primary focus:ring-primary-light` |
| `focus:ring-indigo-100 focus:border-indigo-400` (input, line 143) | `focus:ring-primary-light focus:border-primary` |
| `bg-indigo-600 text-white ... hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200` (submit button, line 158) | `bg-primary text-white ... hover:bg-primary-dark hover:shadow-lg hover:shadow-primary-light` |

- [ ] **Step 2: `ColumnSelect.jsx`**

Find:
```
focus:ring-indigo-100 focus:border-indigo-400
```
Replace with:
```
focus:ring-primary-light focus:border-primary
```

- [ ] **Step 3: `DataPreview.jsx`**

| Old | New |
|---|---|
| `text-indigo-500` (TableProperties icon, line 27) | `text-primary` |
| `text-indigo-600 ... bg-indigo-50` (header badge, line 33) | `text-primary-dark ... bg-primary-light` |
| `bg-indigo-100/80 text-indigo-900 ... hover:bg-indigo-100` (selected header row, line 52) | `bg-primary-light/80 text-primary-dark ... hover:bg-primary-light` |

- [ ] **Step 4: `StepDot.jsx`**

Find:
```js
            ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
            : active
            ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-sm ring-2 ring-indigo-100"
```
Replace with:
```js
            ? "bg-primary-light text-primary-dark border-primary-light shadow-sm"
            : active
            ? "bg-primary-light text-primary-dark border-primary-light shadow-sm ring-2 ring-primary-light"
```

- [ ] **Step 5: `UploadStep.jsx`**

Find:
```
bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]
```
Replace with:
```
bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary-light active:scale-[0.98]
```

- [ ] **Step 6: `UploadSlot.jsx`**

| Old | New |
|---|---|
| `border-indigo-300 bg-indigo-50/10` (loading state) | `border-primary-light bg-primary-light/10` |
| `border-emerald-300 bg-emerald-50/30` (file-loaded state) | `border-primary-light bg-primary-light/30` |
| `hover:border-indigo-200` (idle state) | `hover:border-primary-light` |
| `bg-indigo-100 text-indigo-600` (loading icon circle) | `bg-primary-light text-primary-dark` |
| `bg-emerald-100 text-emerald-600` (loaded icon circle) | `bg-primary-light text-primary-dark` |
| `text-indigo-600` (loading label, line 46) | `text-primary` |
| `text-indigo-600 hover:text-indigo-700` ("Pilih file" link, line 72) | `text-primary hover:text-primary-dark` |

- [ ] **Step 7: `ValidationReport.jsx`**

| Old | New |
|---|---|
| `text-emerald-500` (CheckCircle2 icon, ×2: line 12, 84) | `text-primary` |
| `text-amber-500` (AlertTriangle icon, ×2: line 14, 82) | `text-accent-gold` |
| `text-blue-500` (Info icon, line 15) | `text-accent-sky` |
| `bg-emerald-50 border-emerald-200` (success bgMap, line 22) | `bg-primary-light border-primary-light` |
| `bg-amber-50 border-amber-200` (warning bgMap, line 23) | `bg-accent-gold/15 border-accent-gold/40` |
| `bg-blue-50 border-blue-200` (info bgMap, line 24) | `bg-accent-sky/10 border-accent-sky/30` |

- [ ] **Step 8: Verify**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/pencocokan/ConfigureStep.jsx src/components/pencocokan/ColumnSelect.jsx src/components/pencocokan/DataPreview.jsx src/components/pencocokan/StepDot.jsx src/components/pencocokan/UploadStep.jsx src/components/pencocokan/UploadSlot.jsx src/components/pencocokan/ValidationReport.jsx
git commit -m "feat: rebrand Pencocokan wizard step components to brand palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Rebrand Pencocokan Anomaly & Results components

**Files:**
- Modify: `src/components/pencocokan/AnomalyStep.jsx`
- Modify: `src/components/pencocokan/ResultsDashboard.jsx` (Tailwind classes only — the hex `COLORS` object was already done in Task 2, don't touch those lines again)
- Modify: `src/pages/PencocokanPage.jsx`

**Interfaces:**
- Consumes: brand tokens from Task 1.

- [ ] **Step 1: `AnomalyStep.jsx`**

3 tab buttons (Perbedaan Nama / Format NIK Tidak Standar / NIK Duplikat) repeat the same active-state string at lines 114, 134, 154, and the same inactive-badge string at 121, 141, 161 — apply to all occurrences:

| Old | New |
|---|---|
| `border-indigo-600 text-indigo-600 font-bold` (×3, tab active state) | `border-primary text-primary font-bold` |
| `bg-indigo-100 text-indigo-700` (×3, inactive-tab count badge when NOT active — appears inside a ternary alongside `bg-slate-100 text-slate-600`, only replace the indigo branch) | `bg-primary-light text-primary-dark` |
| `bg-amber-50/70 border border-amber-200` (intro banner, line 93) | `bg-accent-gold/15 border border-accent-gold/40` |
| `text-amber-600` (ShieldAlert icon, line 94) | `text-accent-gold` |
| `text-amber-900` (banner heading, line 96) | `text-neutral-900` |
| `text-amber-800` (banner paragraph, line 99) | `text-neutral-900` |
| `focus:ring-indigo-100 focus:border-indigo-400` (×3 search inputs: lines 185, 308, 444) | `focus:ring-primary-light focus:border-primary` |
| `border-indigo-200 bg-indigo-50 text-indigo-700 ... hover:bg-indigo-100` (Validkan Semua button, line 315) | `border-primary-light bg-primary-light text-primary-dark ... hover:bg-primary-light/70` |
| `border-emerald-200 bg-emerald-50 text-emerald-700 ... hover:bg-emerald-100` (Tetap Cocokkan button, line 192) | `border-primary-light bg-primary-light text-primary-dark ... hover:bg-primary-light/70` |
| `bg-emerald-500 text-white shadow-xs` (Validkan toggle active, line 231) | `bg-primary text-white shadow-xs` |
| `bg-indigo-600 text-white shadow-xs` (Cocokkan toggle active, line 356) | `bg-primary text-white shadow-xs` |
| `text-amber-700` (×3: "Masalah" header line 336, cell line 349, jumlah line 465 — table TEXT) | `text-neutral-900` |
| `bg-indigo-600 text-white ... hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200` (Terapkan & Selesaikan button, line 524) | `bg-primary text-white ... hover:bg-primary-dark hover:shadow-lg hover:shadow-primary-light` |

- [ ] **Step 2: `ResultsDashboard.jsx` — Tailwind classes (not the hex `COLORS` from Task 2)**

| Old | New |
|---|---|
| `bg-emerald-50 border border-emerald-200 text-emerald-700` (success banner, line 64) | `bg-primary-light border border-primary-light text-primary-dark` |
| `bg-amber-50 border border-amber-200 ... text-amber-800` (mismatch summary, line 154) | `bg-accent-gold/15 border border-accent-gold/40 ... text-neutral-900` |
| `bg-indigo-600 text-white ... hover:bg-indigo-700` (Unduh Excel button, line 165) | `bg-primary text-white ... hover:bg-primary-dark` |
| `bg-gradient-to-r from-indigo-500 to-purple-500 ... hover:from-indigo-600 hover:to-purple-600` (Lihat Dashboard Lengkap button, line 174) | `bg-gradient-to-r from-primary to-secondary ... hover:from-primary-dark hover:to-secondary-dark` |

- [ ] **Step 3: `PencocokanPage.jsx`**

| Old | New |
|---|---|
| `bg-indigo-100 text-indigo-600` (header icon circle, line 129) | `bg-primary-light text-primary-dark` |
| `bg-red-50 text-red-700 border border-red-200` (error banner, line 158) | `bg-accent-red/10 text-accent-red border border-accent-red/30` |

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/pencocokan/AnomalyStep.jsx src/components/pencocokan/ResultsDashboard.jsx src/pages/PencocokanPage.jsx
git commit -m "feat: rebrand Pencocokan Anomaly & Results components to brand palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Residual sweep & final verification

**Files:**
- None expected to change — this task verifies Tasks 1-7 left no old-palette color behind, and does a visual pass.

**Interfaces:**
- Consumes: everything from Tasks 1-7.

- [ ] **Step 1: Grep for any remaining old-palette brand/semantic colors**

Run:
```bash
grep -rnE "indigo-[0-9]+|emerald-[0-9]+|amber-[0-9]+|red-(50|100|200|300|400|500|600|700)|blue-(50|100|200|300|400|500)|purple-[0-9]+" src --include="*.jsx"
```
Expected: **no output**. `slate-*` and any `red-`/`text-red`/etc. that were never in the original 27-file list are not a concern (this plan's scope was exactly the classes the spec's grep found — if this command surfaces something unexpected, it means a task missed an occurrence; go fix it in the file it belongs to per this plan's task breakdown, then re-run this grep).

If the grep is not empty, do NOT fix it in this task — go back to whichever Task (2-7) owns that file per the File lists above, apply the missing substitution-table row there, commit under that task's message, then re-run this grep.

- [ ] **Step 2: Full lint + build**

Run: `npm run lint && npm run build`
Expected: clean, same warning set as the pre-rebrand baseline.

- [ ] **Step 3: Visual smoke pass**

Run: `npm run dev`, open the app in a browser (or use the `run` skill if available), and check:
- Sidebar: logo gradient, active-tab highlight, collapse toggle — should read green (primary), not indigo.
- Proses Data wizard: upload slot hover/loaded states, step dots, "Lanjut" button, Anomali tabs and their "Validkan"/"Cocokkan" toggle buttons, final "Terapkan & Selesaikan" button — all green-branded; amber banner (NIK Duplikat info box) should have dark (not white) text on the gold background and be legible.
- Hasil page: donut chart (green/red/gold slices), "Lihat Dashboard Lengkap" button (green→blue-violet gradient).
- Dashboard (`/dashboard/:id`): bento grid — Ringkasan donut, Distribusi Keterangan bars, Perbandingan Jumlah Cocok per Program bars, Cross-Program matrix intensity shading (green now, not indigo), Review Anomali tabs.
- Riwayat & Pencarian: session cards' progress bars (green/gold/red by percentage), NIK search result badges.

Confirm no console errors.

- [ ] **Step 4: No commit needed for this task if the grep in Step 1 was clean** — this is a verification-only task. If Step 1 required fixes, those were committed under their owning task's message already.
