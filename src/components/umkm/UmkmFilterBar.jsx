import React from 'react'

export default function UmkmFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
}) {
  const getCategoryIcon = (cat) => {
    if (!cat || cat.id === 'all') return 'apps'
    const slug = (cat.slug || cat.id || '').toLowerCase()
    const name = (cat.name || '').toLowerCase()
    if (slug.includes('kuliner') || name.includes('kuliner') || name.includes('pangan') || name.includes('makan')) return 'restaurant'
    if (slug.includes('kerajinan') || name.includes('kerajinan') || name.includes('kriya') || name.includes('kreatif')) return 'palette'
    if (slug.includes('tani') || slug.includes('pertanian') || name.includes('tani') || name.includes('kebun') || name.includes('bumi')) return 'agriculture'
    if (slug.includes('jasa') || name.includes('jasa') || name.includes('dagang')) return 'handyman'
    return 'storefront'
  }

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-2xs">
      {/* Baris 1: Search Input & Sort Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Field */}
        <div className="relative flex-1 min-w-0">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama UMKM, produk unggulan, pemilik..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs sm:text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer transition-colors"
              title="Hapus pencarian"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-on-surface-variant font-medium hidden sm:inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-base">sort</span>
            Urutkan:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs sm:text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            <option value="popular">Terpopuler</option>
            <option value="az">Nama (A - Z)</option>
            <option value="newest">Terbaru</option>
          </select>
        </div>
      </div>

      {/* Baris 2: Category Filter Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 scrollbar-none w-full border-t border-surface-container-high/40">
        <span className="text-xs text-on-surface-variant font-medium shrink-0 hidden md:inline-flex items-center gap-1 mr-1">
          <span className="material-symbols-outlined text-sm">filter_alt</span>
          Kategori:
        </span>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{getCategoryIcon(cat)}</span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface-variant'
                }`}
              >
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
