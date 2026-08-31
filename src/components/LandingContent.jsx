import { Play, Shield, Cpu, RefreshCw, CheckCircle2, ChevronRight, FileSpreadsheet, AlertCircle, History } from "lucide-react";

/**
 * Komponen Landing Page premium dan estetik.
 * Menyambut pengguna dengan visual interaktif, penjelasan fitur, dan CTA yang memikat.
 */
export default function LandingContent({ onStart, jumlahSesi = 0, onRiwayat }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-indigo-300/30 to-violet-300/0 blur-3xl"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-fuchsia-200/20 to-indigo-300/0 blur-3xl"></div>
        <div className="absolute top-[400px] left-[20%] w-[40%] aspect-square rounded-full bg-indigo-200/10 blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Shield size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-sm block leading-none">NIK Matcher</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Diskominfo Batu</span>
          </div>
        </div>
        <button
          onClick={onStart}
          className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          Buka Aplikasi <ChevronRight size={13} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Teknologi Web Worker - Super Cepat
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] m-0">
            Pencocokan NIK <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
              Aman, Cepat & Offline
            </span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-xl m-0">
            Unggah dan selaraskan data gabungan OPD dengan data pembanding dalam hitungan detik. 
            Didesain khusus untuk menangani file besar tanpa *freeze*, dengan keamanan 100% lokal di browser Anda.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3.5 pt-2">
            <button
              onClick={onStart}
              className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300/40 transition-all flex items-center gap-2 cursor-pointer active:scale-98 group"
            >
              Mulai Pencocokan Sekarang
              <Play size={14} className="fill-current group-hover:translate-x-0.5 transition-transform" />
            </button>
            {jumlahSesi > 0 && (
              <button
                onClick={onRiwayat}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
              >
                <History size={16} />
                Lihat Riwayat ({jumlahSesi})
              </button>
            )}
            <a
              href="#fitur"
              className="h-12 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-semibold transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Diagram */}
        <div className="lg:col-span-5 relative">
          <div className="relative bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-100/50 max-w-md mx-auto">
            {/* Diagram Flow */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 hover:translate-x-1 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 m-0">Data OPD (Gabungan)</p>
                  <p className="text-[10px] text-slate-400 m-0">Excel NIK & Nama Penduduk</p>
                </div>
              </div>

              <div className="flex items-center justify-center py-1">
                <div className="h-6 w-[2px] bg-gradient-to-b from-blue-300 to-indigo-500 rounded-full animate-bounce"></div>
              </div>

              <div className="flex items-center gap-3 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 shadow-xs relative">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-spin-slow">
                  <Cpu size={16} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-xs font-bold text-indigo-900 m-0">Pencocokan Lokal (Web Worker)</p>
                  <p className="text-[10px] text-indigo-700/80 m-0">Membandingkan NIK secara asinkron</p>
                </div>
                <span className="absolute right-3 top-3.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div className="flex items-center justify-center py-1">
                <div className="h-6 w-[2px] bg-gradient-to-b from-indigo-500 to-emerald-500 rounded-full"></div>
              </div>

              <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 hover:translate-x-1 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-900 m-0">Konfirmasi Anomali & Ekspor</p>
                  <p className="text-[10px] text-emerald-700 m-0">Review nama berbeda & unduh XLSX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-200/60 py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-extrabold text-indigo-600 font-mono m-0">100%</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Offline / Lokal</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600 font-mono m-0">&lt; 3 Detik</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Untuk 50k+ Data</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600 font-mono m-0">0%</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Risiko Freeze</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-600 font-mono m-0">Interactive</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5">Resolusi Anomali</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="max-w-6xl mx-auto px-6 py-20 relative z-10 text-center">
        <div className="max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight m-0">
            Fitur Utama untuk Produktivitas Anda
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed m-0">
            Meningkatkan efisiensi kerja pencocokan data kependudukan tanpa hambatan teknis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Shield size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 m-0 mb-2">Privasi Keamanan Tinggi</h4>
            <p className="text-xs text-slate-500 leading-relaxed m-0">
              Seluruh berkas diproses di dalam memori web browser Anda. Data penduduk sensitif tidak pernah dikirim ke server mana pun di internet.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 animate-spin-slow">
              <RefreshCw size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 m-0 mb-2">Pemrosesan Asinkron</h4>
            <p className="text-xs text-slate-500 leading-relaxed m-0">
              Web Worker mengambil alih tugas pembacaan dan pencarian NIK di thread terpisah. Browser Anda tetap responsif bahkan saat memproses ribuan data.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <AlertCircle size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 m-0 mb-2">Resolusi Anomali Langsung</h4>
            <p className="text-xs text-slate-500 leading-relaxed m-0">
              Jangan biarkan perbedaan kecil nama (typo) merusak hasil. Review dan validasi setiap ketidakcocokan nama secara interaktif sebelum diekspor.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 text-xs py-10 border-t border-slate-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <Shield size={14} />
            </div>
            <span className="font-bold">NIK Matcher</span>
          </div>
          <p className="m-0 text-slate-400">
            &copy; 2026 Dinas Komunikasi dan Informatika Kota Batu. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
