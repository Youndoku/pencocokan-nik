# Tech Stack

## Ringkasan

| Layer | Pilihan | Kenapa |
|---|---|---|
| Build tool | **Vite** | Ringan, cepat, cukup untuk static site tanpa SSR/backend |
| UI library | **React** (JSX) | Cocok untuk state kompleks (banyak dropdown, checklist dinamis) |
| Styling | **Tailwind CSS** (via `@tailwindcss/vite`) | Cepat dikembangkan, konsisten, mudah di-restyle |
| Baca/tulis Excel | **xlsx (SheetJS)** | Standar de-facto untuk parsing Excel di JavaScript, jalan di browser |
| Icon | **lucide-react** | Ringan, konsisten dengan style Tailwind |
| Linter | **ESLint** | Ekosistem plugin lebih matang dibanding Oxlint untuk kebutuhan React |

## Yang secara sadar TIDAK dipakai

- **Tidak ada backend** (Express/FastAPI/dll) — semua proses di browser.
  Lihat `AGENTS.md` bagian "Aturan non-negosiabel" untuk alasannya (privasi
  data NIK).
- **Tidak ada database** — tidak ada state yang persisten antar sesi.
- **Tidak ada Next.js** — tidak butuh SSR/routing kompleks, Vite lebih pas
  untuk single-page tool sederhana seperti ini.
- **Tidak ada state management library** (Redux/Zustand/dll) — cukup
  `useState`/`useMemo`/`useCallback` bawaan React, dikonsolidasi dalam 1
  custom hook (`usePencocokanNIK`).

## Instalasi

```bash
npm create vite@latest pencocokan-nik -- --template react
cd pencocokan-nik
npm install tailwindcss @tailwindcss/vite xlsx lucide-react
```

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css`:
```css
@import "tailwindcss";
```

## Library penting: xlsx (SheetJS)

Dua opsi krusial yang WAJIB selalu dipakai (pernah jadi bug nyata — file
hasil membengkak 9x lipat tanpa opsi ini):

```js
// saat membaca file upload
XLSX.utils.sheet_to_json(sheet, {
  defval: "",
  raw: false,
  blankrows: false, // lewati baris kosong akibat "used range" Excel yang bengkak
});

// saat menulis file hasil
XLSX.writeFile(wb, fileName, { compression: true });
```

## Deployment

Karena tidak ada backend, hasil `npm run build` adalah **file statis**
(`dist/`). Bisa:
- Dihosting di server internal Diskominfo (static hosting biasa), atau
- Dibuka langsung secara lokal tanpa server (tergantung kebutuhan distribusi
  ke rekan-rekan Diskominfo lain).

Tidak perlu server Node.js yang menyala terus-menerus.
