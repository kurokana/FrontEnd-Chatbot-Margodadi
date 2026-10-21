import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FilterBar from '../../components/admin/FilterBar'
import StatusBadge from '../../components/admin/StatusBadge'
import ChannelBadge from '../../components/admin/ChannelBadge'
import CategoryBadge from '../../components/admin/CategoryBadge'
import Pagination from '../../components/admin/Pagination'
import conversationService from '../../services/conversationService'
import operatorService from '../../services/operatorService'
import { formatWIB } from '../../utils/dateUtils'

export default function ConversationsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialStatusFromUrl = searchParams.get('status') || 'ALL'

  // Filter States
  const [activeTab, setActiveTab] = useState(
    initialStatusFromUrl === 'NEED_HUMAN' ? 'hitl' : initialStatusFromUrl.toLowerCase()
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState(
    initialStatusFromUrl === 'NEED_HUMAN' ? 'NEED_HUMAN' : 'ALL'
  )
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [operatorFilter, setOperatorFilter] = useState('ALL')

  // API States
  const [conversations, setConversations] = useState([])
  const [operators, setOperators] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hitlCount, setHitlCount] = useState(0)

  const tabs = [
    { id: 'all', label: 'Semua Percakapan', icon: 'forum', filterStatus: 'ALL' },
    {
      id: 'hitl',
      label: 'Perlu Tindakan (HITL)',
      icon: 'crisis_alert',
      filterStatus: 'NEED_HUMAN',
      badge: hitlCount > 0 ? String(hitlCount) : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    { id: 'open', label: 'Baru / Terbuka', icon: 'mark_chat_unread', filterStatus: 'OPEN' },
    { id: 'assigned', label: 'Ditugaskan', icon: 'person', filterStatus: 'ASSIGNED' },
    { id: 'pending', label: 'Pending', icon: 'schedule', filterStatus: 'PENDING' },
    { id: 'resolved', label: 'Selesai', icon: 'check_circle', filterStatus: 'RESOLVED' },
  ]

  // Fetch Operators for filter dropdown
  useEffect(() => {
    async function loadOperators() {
      try {
        const res = await operatorService.getOperators()
        if (res?.data) {
          setOperators(res.data)
        }
      } catch (err) {
        console.error('Failed to load operators:', err)
      }
    }
    loadOperators()
  }, [])

  // Fetch Conversations from API
  const fetchConversations = useCallback(async (isQuiet = false) => {
    if (!isQuiet) setIsLoading(true)
    try {
      const params = {
        page: currentPage,
        per_page: 15,
      }

      if (statusFilter === 'NEED_HUMAN') {
        params.status = 'NEED_HUMAN'
      } else if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }

      if (channelFilter !== 'ALL') params.channel = channelFilter
      if (searchQuery.trim()) params.search = searchQuery.trim()

      if (operatorFilter === 'UNASSIGNED') {
        // Handle unassigned
      } else if (operatorFilter !== 'ALL') {
        const foundOp = operators.find((o) => o.id === operatorFilter || o.operator_id === Number(operatorFilter))
        if (foundOp) params.operator_id = foundOp.operator_id
      }

      const res = await conversationService.getConversations(params)
      if (res?.data) {
        setConversations(res.data)
        if (res.meta) setMeta(res.meta)
      }

      // Also fetch quick count for HITL badge if not on HITL tab
      if (statusFilter !== 'NEED_HUMAN') {
        const hitlRes = await conversationService.getConversations({ status: 'NEED_HUMAN', per_page: 1 })
        if (hitlRes?.meta) {
          setHitlCount(hitlRes.meta.total)
        }
      } else if (res?.meta) {
        setHitlCount(res.meta.total)
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      if (!isQuiet) setIsLoading(false)
    }
  }, [currentPage, statusFilter, channelFilter, searchQuery, operatorFilter, operators])

  useEffect(() => {
    fetchConversations()

    // Auto-polling interval every 8 seconds for live inbox updates
    const interval = setInterval(() => {
      fetchConversations(true)
    }, 8000)

    return () => clearInterval(interval)
  }, [fetchConversations])

  const handleTabChange = (tab) => {
    setActiveTab(tab.id)
    setStatusFilter(tab.filterStatus)
    setCurrentPage(1)
    if (tab.filterStatus === 'ALL') {
      searchParams.delete('status')
    } else {
      searchParams.set('status', tab.filterStatus)
    }
    setSearchParams(searchParams)
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setChannelFilter('ALL')
    setStatusFilter('ALL')
    setCategoryFilter('ALL')
    setOperatorFilter('ALL')
    setActiveTab('all')
    setCurrentPage(1)
    setSearchParams({})
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inbox Percakapan Layanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola dan pantau percakapan interaksi warga dari Website dan WhatsApp Pekon Margodadi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConversations}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <span className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-medium">
            Total Sesuai Filter: <strong className="text-slate-900">{meta.total}</strong> percakapan
          </span>
        </div>
      </div>

      {/* Navigation Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setCurrentPage(1)
        }}
        channelFilter={channelFilter}
        onChannelChange={(val) => {
          setChannelFilter(val)
          setCurrentPage(1)
        }}
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val)
          setCurrentPage(1)
          if (val === 'NEED_HUMAN') setActiveTab('hitl')
          else if (val === 'ALL') setActiveTab('all')
          else if (val === 'OPEN') setActiveTab('open')
          else if (val === 'ASSIGNED') setActiveTab('assigned')
          else if (val === 'PENDING') setActiveTab('pending')
          else if (val === 'RESOLVED') setActiveTab('resolved')
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        operatorFilter={operatorFilter}
        onOperatorChange={(val) => {
          setOperatorFilter(val)
          setCurrentPage(1)
        }}
        operators={operators}
        onReset={handleResetFilter}
      />

      {/* Conversations List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
            <p className="text-xs font-medium text-slate-500">Memuat data percakapan...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              chat_bubble_outline
            </span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">
                Tidak ada percakapan yang sesuai dengan filter
              </p>
              <p className="text-xs text-slate-400">
                Coba ubah kata kunci pencarian atau reset filter di atas.
              </p>
            </div>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-primary-container transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {conversations.map((conv) => (
              <div
                key={conv.id || conv.conversation_id}
                onClick={() => navigate(`/admin/conversations/${conv.id || conv.conversation_id}`)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all cursor-pointer group ${
                  conv.needs_human && conv.status !== 'RESOLVED'
                    ? 'bg-amber-50/30 border-l-4 border-l-amber-500'
                    : ''
                }`}
              >
                {/* Left Side Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    conv.channel === 'whatsapp'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white'
                      : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {conv.channel === 'whatsapp' ? 'chat' : 'language'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {conv.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {conv.citizen_name}
                      </span>
                      <ChannelBadge channel={conv.channel} />
                      <CategoryBadge category={conv.category} />
                      <StatusBadge status={conv.status} />

                      {/* Intervention Mode Badge */}
                      {conv.status !== 'RESOLVED' && (
                        conv.needs_human ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="material-symbols-outlined text-[12px] text-amber-700">support_agent</span>
                            <span>Mode Operator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="material-symbols-outlined text-[12px] text-emerald-600">smart_toy</span>
                            <span>Mode AI</span>
                          </span>
                        )
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {conv.last_message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">support_agent</span>
                        <span>
                          Operator:{' '}
                          <strong className="text-slate-700">
                            {conv.assigned_operator ? conv.assigned_operator.name : 'Belum Ditugaskan'}
                          </strong>
                        </span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>
                          {conv.updated_at ? formatWIB(conv.updated_at, 'datetime') : '-'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/conversations/${conv.id || conv.conversation_id}`)
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Chat</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              totalItems={meta.total}
              itemsPerPage={meta.per_page}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
