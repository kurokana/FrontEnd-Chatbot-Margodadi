import { formatWIB } from '../../utils/dateUtils'

export default function MessageBubble({ message }) {
  const { sender, senderName, content, timestamp, created_at, isSystemAlert } = message

  if (isSystemAlert) {
    return (
      <div className="flex items-center justify-center my-3">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-2xs max-w-lg text-center">
          <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
          <span className="font-medium">{content}</span>
          <span className="text-[10px] text-amber-600/70 ml-1">{timestamp}</span>
        </div>
      </div>
    )
  }

  const isUser = sender === 'USER'
  const isAI = sender === 'AI'
  const isOperator = sender === 'OPERATOR'

  return (
    <div
      className={`flex flex-col my-3 max-w-[85%] sm:max-w-[75%] ${
        isUser ? 'self-start' : 'self-end items-end'
      }`}
    >
      {/* Sender Header */}
      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-slate-500">
        {isUser && (
          <>
            <span className="material-symbols-outlined text-slate-400 text-[13px]">person</span>
            <span>{senderName || 'Warga'}</span>
          </>
        )}
        {isAI && (
          <>
            <span className="material-symbols-outlined text-emerald-600 text-[13px]">smart_toy</span>
            <span className="text-emerald-700 font-bold">Virtual Guide (AI)</span>
          </>
        )}
        {isOperator && (
          <>
            <span className="material-symbols-outlined text-sky-600 text-[13px]">support_agent</span>
            <span className="text-sky-700 font-bold">{senderName || 'Operator'}</span>
          </>
        )}
        <span className="text-slate-400 font-normal">
          · {created_at ? formatWIB(created_at, 'time') : (timestamp?.includes('WIB') ? timestamp : `${timestamp} WIB`)}
        </span>
      </div>

      {/* Bubble Body */}
      <div
        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
          isUser
            ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
            : isAI
            ? 'bg-emerald-800 text-white rounded-tr-xs border border-emerald-900/40 shadow-emerald-900/10'
            : 'bg-sky-700 text-white rounded-tr-xs border border-sky-800 shadow-sky-900/10'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>

        {isOperator && (
          <div className="mt-2 pt-1.5 border-t border-sky-600/50 flex items-center justify-between text-[10px] text-sky-100">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">verified_user</span>
              Human-in-the-Loop Verified Response
            </span>
            <span className="material-symbols-outlined text-[12px]">done_all</span>
          </div>
        )}

        {isAI && (
          <div className="mt-2 pt-1.5 border-t border-emerald-700/60 flex items-center justify-between text-[10px] text-emerald-200">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">bolt</span>
              RAG Knowledge Base Answer
            </span>
            <span className="material-symbols-outlined text-[12px]">done_all</span>
          </div>
        )}
      </div>
    </div>
  )
}
