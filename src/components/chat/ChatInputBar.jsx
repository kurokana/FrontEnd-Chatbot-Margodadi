import React from 'react'

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSend,
  isTyping,
  textareaRef,
  isVoiceActive,
  onToggleVoice,
}) {
  const quickSuggestions = [
    { label: 'Syarat Surat Domisili', prompt: 'Bagaimana syarat dan cara membuat surat keterangan domisili di Pekon Margodadi?', category: 'surat', icon: 'description' },
    // { label: 'Katalog UMKM Kopi', prompt: 'Saya ingin tahu daftar produk UMKM olahan kopi robusta unggulan desa.', category: 'umkm', icon: 'storefront' },
    { label: 'Pengajuan SKTM', prompt: 'Bagaimana syarat dan alur pembuatan Surat Keterangan Tidak Mampu (SKTM)?', category: 'surat', icon: 'assignment' },
    { label: 'Surat Izin Usaha Mikro', prompt: 'Apa saja berkas yang harus disiapkan untuk permohonan Surat Keterangan Usaha (SKU)?', category: 'surat', icon: 'badge' },
    // { label: 'Sentra Keripik Pisang', prompt: 'Apa saja produk olahan keripik pisang dan UMKM binaan pekon yang tersedia?', category: 'umkm', icon: 'shopping_bag' },
  ]

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-xs border-t border-slate-200/80 p-2 sm:p-4 space-y-2 sm:space-y-3 shrink-0">
      {/* Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs sm:text-sm text-primary">lightbulb</span>
          <span className="hidden xs:inline">Topik:</span>
        </span>
        {quickSuggestions.map((item, idx) => {
          const isUmkm = item.category === 'umkm'
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSend(item.prompt)}
              disabled={isTyping}
              className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border whitespace-nowrap transition-all cursor-pointer font-medium disabled:opacity-50 flex items-center gap-1 shadow-2xs hover:shadow-xs shrink-0 ${
                isUmkm
                  ? 'bg-amber-50/80 hover:bg-amber-600 hover:text-white hover:border-amber-600 text-amber-900 border-amber-200/80'
                  : 'bg-emerald-50/80 hover:bg-primary hover:text-white hover:border-primary text-emerald-900 border-emerald-200/80'
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Input Box & Action Buttons */}
      <div className="flex items-end gap-1.5 sm:gap-2 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-2xs">
        {/* Voice Toggle Button */}
        <button
          type="button"
          onClick={onToggleVoice}
          title={isVoiceActive ? 'Matikan Mikrofon' : 'Gunakan Input Suara'}
          className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            isVoiceActive
              ? 'bg-rose-500 text-white animate-pulse shadow-xs'
              : 'text-slate-400 hover:text-primary hover:bg-slate-200/60'
          }`}
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">
            {isVoiceActive ? 'mic' : 'mic_none'}
          </span>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pertanyaan administrasi surat atau produk UMKM..."
          className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-24 sm:max-h-28 py-1 sm:py-1.5 px-1 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => onSend()}
          disabled={isTyping || !inputText.trim()}
          className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-emerald-700 hover:from-primary hover:to-primary text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-base sm:text-lg">send</span>
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="sm:hidden truncate text-[10px] text-slate-600">RAG Terverifikasi Pekon Margodadi</span>
          <span className="hidden sm:inline text-slate-600">Basis Pengetahuan RAG Aktif • Verifikasi Balai Pekon Margodadi</span>
        </div>
        <span className="hidden sm:inline text-slate-400 shrink-0">Shift + Enter untuk baris baru</span>
      </div>
    </div>
  )
}
