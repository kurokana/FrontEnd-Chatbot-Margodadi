import { useState, useEffect, useCallback } from 'react'
import DataTable from '../../components/admin/DataTable'
import Pagination from '../../components/admin/Pagination'
import activityLogService from '../../services/activityLogService'
import { formatWIB } from '../../utils/dateUtils'

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
  const [stats, setStats] = useState({
    total_logs: 0,
    today_logs: 0,
    operator_actions: 0,
    hitl_escalations: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: 20,
      }
      if (actionFilter !== 'ALL') params.action = actionFilter
      if (channelFilter !== 'ALL') params.channel = channelFilter
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()

      const res = await activityLogService.getActivityLogs(params)
      if (res?.data) {
        setLogs(res.data)
        if (res.meta) setMeta(res.meta)
        if (res.stats) setStats(res.stats)
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, actionFilter, channelFilter, debouncedSearch])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const getActionBadge = (action) => {
    switch (action) {
      case 'TAKE_OVER':
      case 'HITL_ESCALATION':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">front_hand</span>
            <span>{action === 'TAKE_OVER' ? 'TAKE OVER HITL' : 'PENGALIHAN AI'}</span>
          </span>
        )
      case 'ASSIGN_OPERATOR':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">person_add</span>
            <span>PENUGASAN</span>
          </span>
        )
      case 'OPERATOR_RESPONSE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">chat</span>
            <span>RESPONS OPERATOR</span>
          </span>
        )
      case 'STATUS_CHANGE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">sync_alt</span>
            <span>STATUS TIKET</span>
          </span>
        )
      case 'OPERATOR_STATUS':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">badge</span>
            <span>KEHADIRAN</span>
          </span>
        )
      case 'LOGIN':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">login</span>
            <span>LOGIN MASUK</span>
          </span>
        )
      case 'LOGOUT':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">logout</span>
            <span>LOGOUT KELUAR</span>
          </span>
        )
      case 'SETTING_CHANGE':
      case 'PROFILE_UPDATE':
      case 'PASSWORD_CHANGE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">settings</span>
            <span>PENGATURAN</span>
          </span>
        )
      case 'RESEARCH_EXPORT':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">download</span>
            <span>EKSPOR RISET</span>
          </span>
        )
      case 'CHAT_SESSION_START':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">forum</span>
            <span>SESI WARGA</span>
          </span>
        )
      case 'VECTOR_DOC_CREATE':
      case 'VECTOR_DOC_UPDATE':
      case 'VECTOR_DOC_DELETE':
      case 'VECTOR_REINDEX':
      case 'VECTOR_REINDEX_ALL':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">hub</span>
            <span>DATA VEKTOR AI</span>
          </span>
        )
      case 'FEEDBACK_SUBMITTED':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">star</span>
            <span>FEEDBACK WARGA</span>
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {action}
          </span>
        )
    }
  }

  const columns = [
    {
      header: 'Waktu Aktivitas',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
          <div className="flex flex-col">
            <span className="font-mono text-xs text-slate-800 font-semibold">
              {row.created_at ? formatWIB(row.created_at, 'time') : `${row.timestamp} WIB`}
            </span>
            <span className="text-[10px] text-slate-400">
              {row.created_at ? formatWIB(row.created_at, 'date') : row.date}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Aktor / Operator',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
            {row.actor ? row.actor.charAt(0).toUpperCase() : 'S'}
          </div>
          <span className="font-bold text-slate-900 text-xs">{row.actor}</span>
        </div>
      ),
    },
    {
      header: 'Tipe Tindakan',
      render: (row) => getActionBadge(row.action),
    },
    {
      header: 'Objek / Target',
      render: (row) => (
        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-xs border border-slate-200/60">
          {row.target || '-'}
        </span>
      ),
    },
    {
      header: 'Deskripsi Aktivitas',
      render: (row) => (
        <span className="text-xs text-slate-700 leading-relaxed font-normal">
          {row.description}
        </span>
      ),
    },
    {
      header: 'Kanal',
      render: (row) => {
        const isWa = row.channel?.toLowerCase().includes('whatsapp')
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
              isWa
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {row.channel || 'WEB'}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Log Aktivitas & Audit Trail Real-Time</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Live
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit trail otomatis mencatat interaksi autentikasi aparatur, respons percakapan, eskalasi HITL, dan interaksi warga desa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            title="Muat Ulang Data"
          >
            <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">dataset</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Catatan Log</div>
            <div className="text-lg font-black text-slate-900">{stats.total_logs}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">today</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Aktivitas Hari Ini</div>
            <div className="text-lg font-black text-emerald-600">+{stats.today_logs}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">support_agent</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tindakan Aparatur</div>
            <div className="text-lg font-black text-purple-600">{stats.operator_actions}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">front_hand</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Eskalasi / Intervensi</div>
            <div className="text-lg font-black text-rose-600">{stats.hitl_escalations}</div>
          </div>
        </div>
      </div>

      {/* Filter & Table Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktor, target tiket, atau deskripsi log..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">Semua Tindakan</option>
              <option value="OPERATOR_RESPONSE">Respons Operator</option>
              <option value="ASSIGN_OPERATOR">Penugasan Percakapan</option>
              <option value="STATUS_CHANGE">Perubahan Status Tiket</option>
              <option value="HITL_ESCALATION">Pengalihan AI ke Operator</option>
              <option value="OPERATOR_STATUS">Status Kehadiran Operator</option>
              <option value="LOGIN">Aparatur Masuk (Login)</option>
              <option value="LOGOUT">Aparatur Keluar (Logout)</option>
              <option value="SETTING_CHANGE">Konfigurasi RAG</option>
              <option value="PROFILE_UPDATE">Pembaruan Profil</option>
              <option value="PASSWORD_CHANGE">Ubah Kata Sandi</option>
              <option value="VECTOR_DOC_CREATE,VECTOR_DOC_UPDATE,VECTOR_DOC_DELETE,VECTOR_REINDEX,VECTOR_REINDEX_ALL">Data Vektor & Knowledge Base</option>
              <option value="RESEARCH_EXPORT">Ekspor Dataset Penelitian</option>
              <option value="CHAT_SESSION_START">Sesi Percakapan Warga</option>
              <option value="FEEDBACK_SUBMITTED">Feedback & Rating Warga</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="ALL">Semua Kanal</option>
              <option value="WEB">Web Portal Pekon</option>
              <option value="WHATSAPP">WhatsApp Pekon</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">
              progress_activity
            </span>
            <p className="text-xs">Memuat log aktivitas real-time...</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={logs}
              emptyMessage="Belum ada catatan aktivitas yang sesuai dengan filter pencarian."
            />

            {meta.last_page > 1 && (
              <div className="pt-2">
                <Pagination
                  currentPage={meta.current_page}
                  totalPages={meta.last_page}
                  totalItems={meta.total}
                  itemsPerPage={meta.per_page}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

