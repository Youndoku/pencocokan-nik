# Task 1 Report: Shell Utama & Step Indicator

## What Was Implemented
- Merancang ulang layout global menjadi modern menggunakan card terpusat (Centered Focus Card) dengan warna background `bg-slate-50` dan aksen indigo top ambient glow.
- Mendesain ulang progress tracker `StepDot` menjadi chip-style wizard bar yang menyatu secara visual, fleksibel, responsif, dan tidak memiliki garis yang bertumpukan dengan label teks.
- Memperbaiki bahasa di teks header (`src/App.jsx`) dari "and" menjadi "dan" sesuai pedoman Bahasa Indonesia.

## Verification & Build Results
- `npm run lint` selesai dengan sukses tanpa error atau warning.
- `npm run build` selesai dengan sukses dengan membundel semua aset secara benar.

## Files Changed
- `src/App.jsx`
- `src/components/StepDot.jsx`

## Self-Review Findings
- Semua visual sudah diselaraskan dan dicek ulang. Tidak ada sisa garis absolute yang bocor atau z-index lingkaran yang terpotong karena step indikator kini menggunakan desain berbasis flexbox-chip.
