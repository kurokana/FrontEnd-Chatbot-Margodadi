import React from 'react'
import DataTable from '../admin/DataTable'
import Pagination from '../admin/Pagination'

export default function KnowledgeDocumentsTab({
  documents,
  isLoading,
  searchQuery,
  onSearchChange,
  domainFilter,
  onDomainFilterChange,
  currentPage,
  onPageChange,
  meta,
  onOpenCreate,
  onOpenEdit,
  onOpenInspector,
  onReindexDoc,
  onDeleteDoc,
}) {
  const getDomainBadge = (domain) => {
    switch (domain) {
      case 'PUBLIC_SERVICE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">account_balance</span>
            <span>Layanan Publik</span>
          </span>
        )
      case 'UMKM':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">storefront</span>
            <span>Potensi UMKM</span>
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {domain}
          </span>
        )
    }
  }

  const columns = [
    {
      header: 'Dokumen & Kode',
      accessor: 'title',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {row.doc_code}
            </span>
            <span className="font-semibold text-slate-900 text-sm">{row.title}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Sumber: <strong className="text-slate-700">{row.source}</strong></span>
            <span>•</span>
            <span>Validator: <strong className="text-slate-700">{row.validator}</strong></span>
          </div>
        </div>
      ),
    },
    {
      header: 'Domain Layanan',
      accessor: 'domain',
      render: (row) => getDomainBadge(row.domain),
    },
    {
      header: 'Potongan Vektor',
      accessor: 'chunks_count',
      render: (row) => (
        <button
          type="button"
          onClick={() => onOpenInspector(row)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">segment</span>
          <span>{row.chunks_count} Chunks</span>
        </button>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          {row.is_active ? 'Aktif' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Terakhir Diperbarui',
      accessor: 'updated_at',
      render: (row) => <span className="text-xs text-slate-500">{row.updated_at}</span>,
    },
    {
      header: 'Aksi',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => onOpenInspector(row)}
            title="Lihat Potongan Vektor (Chunk Inspector)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(row)}
            title="Edit Dokumen & Isi Pengetahuan"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            type="button"
            onClick={() => onReindexDoc(row.document_id)}
            title="Re-index Potongan Vektor"
            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">autorenew</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteDoc(row.document_id, row.title)}
            title="Hapus Dokumen"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari judul SOP, kata kunci teks, validator..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'ALL', label: 'Semua Domain' },
              { id: 'PUBLIC_SERVICE', label: 'Layanan Publik' },
              { id: 'UMKM', label: 'UMKM' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => onDomainFilterChange(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  domainFilter === d.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Document Button */}
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Tambah Dokumen SOP</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Memuat basis pengetahuan dan potongan vektor...</p>
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={documents} />
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Menampilkan <strong>{documents.length}</strong> dari <strong>{meta.total}</strong> dokumen pengetahuan
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={meta.last_page}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
