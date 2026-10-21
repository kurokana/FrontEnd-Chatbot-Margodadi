import React from 'react'

/**
 * Komponen Modal Peringatan Inaktivitas (Idle Timeout Warning)
 * Ditampilkan di menit ke-55 sebelum sesi ditutup otomatis pada menit ke-60.
 */
export default function IdleTimeoutModal({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}) {
  if (!isOpen) return null

  // Format detik ke MM:SS
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
        {/* Subtle amber ambient glow behind card */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 animate-pulse text-amber-400">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
                Peringatan Keamanan Sesi
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Apakah Anda Masih di Sini?
            </h3>
          </div>
        </div>

        {/* Modal Description */}
        <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
          <p>
            Sistem mendeteksi <span className="font-semibold text-amber-300">tidak ada aktivitas interaksi</span> selama 55 menit terakhir.
          </p>
          <p className="text-slate-400 text-xs">
            Demi menjaga keamanan data dan kerahasiaan layanan pemerintahan Pekon Margodadi, sesi aparatur Anda akan ditutup secara otomatis dalam:
          </p>
        </div>

        {/* Large Countdown Display */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-amber-400 text-2xl animate-spin">
            progress_activity
          </span>
          <div className="text-center">
            <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400 tracking-wider">
              {formattedCountdown}
            </span>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
              Menit : Detik Tersisa
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-primary hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Tetap Masuk</span>
          </button>

          <button
            type="button"
            onClick={onLogoutNow}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800/60 text-slate-300 hover:text-rose-300 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Keluar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  )
}
