import { useState, useEffect, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ScrollToTop from '../components/ScrollToTop'
import AdminSidebar from '../components/admin/AdminSidebar'
import IdleTimeoutModal from '../components/admin/IdleTimeoutModal'
import { useAuth } from '../context/AuthContext'
import useIdleTimeout from '../hooks/useIdleTimeout'
import conversationService from '../services/conversationService'
import authService from '../services/authService'
import { formatWIB } from '../utils/dateUtils'

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/conversations': 'Percakapan (Inbox)',
  '/admin/operators': 'Manajemen Operator',
  '/admin/analytics': 'Analitik Layanan',
  '/admin/reports': 'Laporan Layanan',
  '/admin/knowledge-base': 'Knowledge Base & Vektor AI',
  '/admin/umkm': 'Manajemen Potensi UMKM',
  '/admin/activity-log': 'Activity Log',
  '/admin/settings': 'Pengaturan Sistem',
}

export default function AdminLayout() {
  const { operator, logout } = useAuth()
  const currentRole = operator?.role || 'ADMIN'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [hitlQueueCount, setHitlQueueCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  // Authenticated operator details from database
  const activeOperator = {
    id: operator?.operator_id ? `OP-${String(operator.operator_id).padStart(2, '0')}` : 'OP-01',
    name: operator?.name || 'Aparatur Desa',
    email: operator?.email || 'admin@margodadi.desa.id',
    role: operator?.role || 'ADMIN',
    avatar: operator?.avatar_url || '/favicon.svg',
  }

  // Fetch real HITL counter from DB
  useEffect(() => {
    let isMounted = true
    const fetchHitlCount = async () => {
      try {
        const res = await conversationService.getConversations({ status: 'NEED_HUMAN', per_page: 1 })
        if (isMounted && res?.meta) {
          setHitlQueueCount(res.meta.total || 0)
        }
      } catch (err) {
        console.warn('Failed to load HITL queue count:', err)
      }
    }

    fetchHitlCount()
    const interval = setInterval(fetchHitlCount, 10000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Live Clock Server / Pekon Margodadi (WIB)
  const [currentTimeString, setCurrentTimeString] = useState(() => formatWIB(new Date(), 'header_clock'))

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTimeString(formatWIB(new Date(), 'header_clock'))
    }, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // Handler auto-logout saat inaktivitas > 1 jam
  const handleIdleLogout = useCallback(async () => {
    try {
      await logout()
    } finally {
      navigate('/login?reason=idle_timeout')
    }
  }, [logout, navigate])

  // Hook Idle Inactivity Tracker (60 menit timeout, 5 menit modal warning)
  const { isWarningVisible, remainingSeconds, resetTimer, wasActiveRecently } = useIdleTimeout({
    timeoutMs: 60 * 60 * 1000, // 60 menit
    warningMs: 5 * 60 * 1000,  // 5 menit peringatan sebelum logout
    onLogout: handleIdleLogout,
    onStayLoggedIn: () => {
      authService.heartbeat()
    },
    enabled: true,
  })

  // Heartbeat berkala setiap 60 detik (HANYA dikirim jika operator aktif dalam 5 menit terakhir)
  useEffect(() => {
    let isMounted = true

    // Kirim heartbeat saat layout admin dimuat
    authService.heartbeat()

    const heartbeatInterval = setInterval(() => {
      if (isMounted) {
        // Jika operator diam/idle > 5 menit, stop heartbeat agar status di DB beralih ke OFFLINE
        if (wasActiveRecently(5 * 60 * 1000)) {
          authService.heartbeat()
        }
      }
    }, 60000)

    return () => {
      isMounted = false
      clearInterval(heartbeatInterval)
    }
  }, [wasActiveRecently])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/conversations/')) {
      return 'Detail Percakapan Warga'
    }
    return PAGE_TITLES[location.pathname] || 'Panel Administrasi'
  }

  return (
    <div className="h-screen w-full flex bg-slate-100/90 text-slate-800 font-body overflow-hidden">
      <ScrollToTop />

      {/* STANDALONE ADMIN SIDEBAR COMPONENT (Independent Sticky & Scroll) */}
      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeOperator={activeOperator}
        hitlQueueCount={hitlQueueCount}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT AREA WITH INDEPENDENT SCROLL */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Dashboard Monitoring & Human-in-the-Loop Management Layer
              </p>
            </div>
          </div>

          {/* Top Actions & Quick HITL Alert Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock Server Pekon Margodadi (WIB) */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-mono font-semibold shadow-2xs">
              <span className="material-symbols-outlined text-sm text-primary">schedule</span>
              <span>{currentTimeString}</span>
            </div>

            {/* Quick HITL Button */}
            <Link
              to="/admin/conversations?status=NEED_HUMAN"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-bold shadow-2xs"
            >
              <span className="material-symbols-outlined text-base animate-spin text-rose-600">
                crisis_alert
              </span>
              <span className="hidden md:inline">Antrian HITL:</span>
              <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-md text-[11px]">
                {hitlQueueCount} Butuh Aksi
              </span>
            </Link>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 relative transition-colors cursor-pointer"
                title="Notifikasi Masuk"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {hitlQueueCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Notifikasi Real-time</span>
                    <span
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] text-primary font-bold cursor-pointer hover:underline"
                    >
                      Tutup
                    </span>
                  </div>
                  <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                    {hitlQueueCount > 0 ? (
                      <div
                        onClick={() => {
                          setNotificationsOpen(false)
                          navigate('/admin/conversations?status=NEED_HUMAN')
                        }}
                        className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-100 hover:bg-rose-100/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-800">
                            Eskalasi HITL Membutuhkan Respon
                          </span>
                          <span className="text-[10px] text-rose-600 font-mono">Live</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Terdapat {hitlQueueCount} tiket eskalasi warga yang memerlukan bantuan operator.
                        </p>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Tidak ada notifikasi baru
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DYNAMIC CHILD PAGE CONTENT (Independent Scroll) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ activeOperator, hitlQueueCount }} />
          </div>
        </main>
      </div>

      {/* Idle Timeout Warning Modal (55 Minutes Alert, 60 Minutes Auto-Logout) */}
      <IdleTimeoutModal
        isOpen={isWarningVisible}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={resetTimer}
        onLogoutNow={handleLogout}
      />
    </div>
  )
}
