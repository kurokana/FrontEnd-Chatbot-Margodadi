import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function AdminSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  activeOperator,
  hitlQueueCount,
  onLogout,
}) {
  const currentRole = activeOperator?.role || 'ADMIN'

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'dashboard',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Percakapan (Inbox)',
      path: '/admin/conversations',
      icon: 'forum',
      badge: hitlQueueCount > 0 ? `${hitlQueueCount} HITL` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Manajemen Operator',
      path: '/admin/operators',
      icon: 'badge',
      roles: ['ADMIN'],
    },
    {
      label: 'Analitik Layanan',
      path: '/admin/analytics',
      icon: 'analytics',
      roles: ['ADMIN'],
    },
    {
      label: 'Laporan Layanan',
      path: '/admin/reports',
      icon: 'summarize',
      roles: ['ADMIN'],
    },
    {
      label: 'Basis Data AI',
      path: '/admin/knowledge-base',
      icon: 'hub',
      roles: ['ADMIN'],
    },
    {
      label: 'Layanan Publik',
      path: '/admin/services',
      icon: 'assured_workload',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Potensi UMKM',
      path: '/admin/umkm',
      icon: 'storefront',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Activity Log',
      path: '/admin/activity-log',
      icon: 'history',
      roles: ['ADMIN'],
    },
    {
      label: 'Pengaturan Sistem',
      path: '/admin/settings',
      icon: 'settings',
      roles: ['ADMIN', 'OPERATOR'],
    },
  ]

  const visibleNavItems = navigationItems.filter((item) =>
    item.roles.includes(currentRole)
  )

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Standalone Sidebar Container with Independent Fixed Height & Scroll */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-200 flex flex-col shrink-0 shadow-2xl z-50 lg:z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* 1. Brand Header (Fixed Top) */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <img
              src="/favicon.svg"
              alt="Logo Pekon Margodadi"
              className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-wide">
                  Dashboard Layanan
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Pekon Margodadi</p>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            title="Tutup Menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* 3. Navigation Links (Independent Scroll Container) */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overscroll-contain text-sm font-medium">
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>

          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${isActive
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 4. Sidebar Footer (Fixed Bottom) */}
        <div className="shrink-0 p-3.5 border-t border-slate-800 bg-slate-950/40 space-y-2">
          {/* Quick Active Operator Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <img
              src={activeOperator.avatar || '/favicon.svg'}
              alt={activeOperator.name}
              onError={(e) => {
                e.currentTarget.src = '/favicon.svg'
              }}
              className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0 bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{activeOperator.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{activeOperator.role} · Online</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Web Publik</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
