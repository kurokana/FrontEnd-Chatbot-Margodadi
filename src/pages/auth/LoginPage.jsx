import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason')
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      await login(username, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Autentikasi gagal. Silakan periksa kembali username dan kata sandi Anda.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-950 font-body relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full flex flex-col lg:grid lg:grid-cols-12 min-h-screen z-10">

        {/* ========================================================
            LEFT COLUMN: BRAND SHOWCASE & SYSTEM MONITORING CONSOLE
            ======================================================== */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-[#002b18]/80 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-slate-800/80">

          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <img
                src="/favicon.svg"
                alt="Logo Pekon Margodadi"
                className="w-11 h-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-extrabold text-base sm:text-lg tracking-wide">
                    Virtual Guide
                  </span>

                </div>
                <p className="text-xs text-slate-400">Pemerintahan Pekon Margodadi</p>
              </div>
            </Link>
          </div>

          {/* Center Content & Value Proposition */}
          <div className="relative z-10 my-8 lg:my-0 max-w-xl space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Pusat Kendali Pelayanan Cerdas &amp; Intervensi Manusia
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Platform monitoring real-time untuk aparatur desa dalam mengawasi percakapan warga, mengelola antrean <span className="text-emerald-400 font-semibold"></span>, dan memperbarui basis pengetahuan AI Pekon Margodadi.
              </p>
            </div>

            {/* Live System Capabilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-primary/20 text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-lg">crisis_alert</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Antrean Eskalasi HITL</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Notifikasi otomatis saat warga membutuhkan respon aparatur.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 shrink-0">
                  <span className="material-symbols-outlined text-lg">hub</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">RAG AI Vector Engine</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tersinkronisasi dengan basis data regulasi &amp; SOP Pekon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Footer */}
          <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-emerald-500">verified</span>
              <span>Sistem Terenkripsi &amp; Terproteksi</span>
            </div>
            <span>© 2026 Pekon Margodadi</span>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: AUTHENTICATION FORM
            ======================================================== */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center bg-slate-900/50 backdrop-blur-xl">
          <div className="w-full max-w-md space-y-6">

            {/* Header Login */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Masuk ke Panel
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Gunakan kredensial akun administrator atau operator resmi Anda.
              </p>
            </div>

            {/* Main Form Card */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">

              {/* Idle Timeout Notification Alert */}
              {reason === 'idle_timeout' && (
                <div className="p-3.5 bg-amber-950/60 border border-amber-800/60 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-base text-amber-400 shrink-0 mt-0.5">
                    timer_off
                  </span>
                  <div className="flex-1 leading-snug">
                    <p className="font-bold text-amber-300">Sesi Berakhir Otomatis (Inaktivitas &gt; 1 Jam)</p>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      Sesi aparatur Anda telah ditutup secara otomatis demi keamanan data pekon karena tidak ada aktivitas selama lebih dari 1 jam. Silakan masuk kembali.
                    </p>
                  </div>
                </div>
              )}

              {/* Session Expired Generic Alert */}
              {reason === 'session_expired' && (
                <div className="p-3.5 bg-sky-950/60 border border-sky-800/60 rounded-2xl text-xs text-sky-200 flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-base text-sky-400 shrink-0 mt-0.5">
                    lock_clock
                  </span>
                  <div className="flex-1 leading-snug">
                    <p className="font-bold text-sky-300">Sesi Telah Berakhir</p>
                    <p className="text-[11px] text-sky-200/80 mt-0.5">
                      Masa berlaku sesi login Anda telah selesai. Silakan masukkan kredensial untuk melanjutkan pekerjaan Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-base text-rose-400 shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex-1 leading-snug">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Username / Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      badge
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan username atau email..."
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setErrorMessage('')
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer"
                    >
                      Bantuan Login?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi..."
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setErrorMessage('')
                      }}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5 rounded"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4 cursor-pointer"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-primary hover:from-emerald-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>
                      <span>Mengautentikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Back to Public Web Link */}
              <div className="pt-3 text-center border-t border-slate-800/80">
                <Link
                  to="/"
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1.5 transition-colors group"
                >
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                    arrow_back
                  </span>
                  <span>Kembali ke Portal Publik Warga</span>
                </Link>
              </div>
            </div>

            {/* Bottom Security Info Tag */}
            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm text-slate-500">lock_outline</span>
              <span>Hak Cipta Pemerintah Pekon Margodadi · Lampung</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Help Modal Dialog */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="material-symbols-outlined text-emerald-400">help</span>
                <span>Bantuan Masuk Portal Aparatur</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                Akses portal back-office ini dikhususkan bagi aparatur pemerintah Pekon Margodadi yang terdaftar sebagai <b>Administrator</b> atau <b>Operator Layanan</b>.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  <span>Kendala Akses Akun?</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Jika Anda lupa kata sandi atau akun belum diaktivasi, silakan hubungi tim IT Administrator Pekon Margodadi melalui kantor balai pekon atau kontak internal dinas.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


