/**
 * dateUtils.js
 * Utilitas pemformatan tanggal dan waktu resmi Pekon Margodadi
 * Menggunakan zona waktu terstandarisasi: Asia/Jakarta (WIB - UTC+7)
 */

export const TIMEZONE_WIB = 'Asia/Jakarta'
export const LOCALE_ID = 'id-ID'

/**
 * Format string tanggal / objek Date ke format WIB yang konsisten
 * @param {string|number|Date} dateVal - Nilai tanggal yang akan diformat
 * @param {'time'|'time_short'|'date'|'date_long'|'datetime'|'full'|'header_clock'} formatType
 * @returns {string} String waktu terformat
 */
export function formatWIB(dateVal, formatType = 'datetime') {
  if (!dateVal) return '-'

  try {
    const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal
    if (isNaN(d.getTime())) return '-'

    switch (formatType) {
      case 'time_short':
        return new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d)

      case 'time':
        return `${new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d)} WIB`

      case 'date':
        return new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(d)

      case 'date_long':
        return new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d)

      case 'datetime': {
        const datePart = new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(d)
        const timePart = new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d)
        return `${datePart}, ${timePart} WIB`
      }

      case 'header_clock': {
        const dayDate = new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(d)
        const timeWithSec = new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(d)
        return `${dayDate} · ${timeWithSec} WIB`
      }

      case 'full': {
        const fullDate = new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d)
        const timeWithSec = new Intl.DateTimeFormat(LOCALE_ID, {
          timeZone: TIMEZONE_WIB,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(d)
        return `${fullDate} pukul ${timeWithSec} WIB`
      }

      default:
        return d.toLocaleString(LOCALE_ID, { timeZone: TIMEZONE_WIB })
    }
  } catch (err) {
    console.warn('formatWIB error:', err)
    return '-'
  }
}

/**
 * Mendapatkan jam saat ini dalam format "HH:mm WIB"
 */
export function getCurrentTimeWIB() {
  return formatWIB(new Date(), 'time')
}
