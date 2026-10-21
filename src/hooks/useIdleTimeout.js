import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY_LAST_ACTIVE = 'vg_last_active_time'
const DEFAULT_TIMEOUT_MS = 60 * 60 * 1000 // 60 Menit (1 Jam)
const DEFAULT_WARNING_MS = 5 * 60 * 1000 // 5 Menit sebelum logout (Menit ke-55)
const THROTTLE_MS = 5000 // Minimal interval pencatatan aktivitas (5 detik)

/**
 * Custom hook untuk memantau inaktivitas pengguna (Idle Auto-Logout)
 * Dilengkapi dengan sinkronisasi multi-tab dan modal hitung mundur.
 *
 * @param {Object} options
 * @param {number} [options.timeoutMs=3600000] - Batas inaktivitas sampai auto-logout (default: 60 menit)
 * @param {number} [options.warningMs=300000] - Waktu tampilnya modal peringatan (default: 5 menit sebelum logout)
 * @param {Function} options.onLogout - Callback yang dipanggil saat waktu inaktivitas habis
 * @param {Function} [options.onStayLoggedIn] - Callback opsional saat user menekan "Tetap Masuk"
 * @param {boolean} [options.enabled=true] - Status aktifnya pemantauan inaktivitas
 */
export function useIdleTimeout({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = DEFAULT_WARNING_MS,
  onLogout,
  onStayLoggedIn,
  enabled = true,
}) {
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(Math.floor(warningMs / 1000))

  const lastActivityRef = useRef(Date.now())
  const lastThrottleRef = useRef(0)
  const isWarningRef = useRef(false)

  // Inisialisasi timestamp di localStorage jika belum ada
  useEffect(() => {
    if (!enabled) return

    const stored = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE)
    const now = Date.now()

    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed) && parsed > 0 && parsed <= now) {
        // Jika sudah melewati batas timeout saat halaman pertama kali dimuat
        if (now - parsed >= timeoutMs) {
          onLogout?.()
          return
        }
        lastActivityRef.current = parsed
      } else {
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString())
        lastActivityRef.current = now
      }
    } else {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString())
      lastActivityRef.current = now
    }
  }, [enabled, timeoutMs, onLogout])

  // Fungsi untuk mencatat aktivitas pengguna secara ter-throttle
  const recordActivity = useCallback(() => {
    if (!enabled || isWarningRef.current) return

    const now = Date.now()
    if (now - lastThrottleRef.current < THROTTLE_MS) return

    lastThrottleRef.current = now
    lastActivityRef.current = now
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString())
  }, [enabled])

  // Fungsi untuk mereset timer (misal ketika klik tombol "Tetap Masuk")
  const resetTimer = useCallback(() => {
    const now = Date.now()
    lastThrottleRef.current = now
    lastActivityRef.current = now
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString())

    isWarningRef.current = false
    setIsWarningVisible(false)
    setRemainingSeconds(Math.floor(warningMs / 1000))

    if (onStayLoggedIn) {
      onStayLoggedIn()
    }
  }, [warningMs, onStayLoggedIn])

  // Periksa apakah pengguna aktif dalam rentang waktu tertentu (misal 5 menit terakhir untuk heartbeat)
  const wasActiveRecently = useCallback((withinMs = 5 * 60 * 1000) => {
    const now = Date.now()
    const diff = now - lastActivityRef.current
    return diff <= withinMs
  }, [])

  // Event listener aktivitas pengguna di DOM
  useEffect(() => {
    if (!enabled) return

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel', 'click']

    const handleUserInteraction = () => {
      recordActivity()
    }

    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [enabled, recordActivity])

  // Sinkronisasi antar-tab menggunakan event 'storage'
  useEffect(() => {
    if (!enabled) return

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_LAST_ACTIVE && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10)
        if (!isNaN(remoteTime)) {
          lastActivityRef.current = remoteTime
          // Jika ada aktivitas di tab lain, tutup modal peringatan di tab ini jika sedang terbuka
          if (isWarningRef.current && Date.now() - remoteTime < timeoutMs - warningMs) {
            isWarningRef.current = false
            setIsWarningVisible(false)
          }
        }
      }

      // Jika token dihapus di tab lain (logout dari tab lain), logout tab ini juga
      if (e.key === 'vg_token' && !e.newValue) {
        onLogout?.()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [enabled, timeoutMs, warningMs, onLogout])

  // Loop evaluasi inaktivitas setiap 1 detik
  useEffect(() => {
    if (!enabled) return

    const checkInterval = setInterval(() => {
      const now = Date.now()
      const idleTime = now - lastActivityRef.current

      // 1. Waktu inaktivitas sudah melampaui timeout (1 Jam)
      if (idleTime >= timeoutMs) {
        isWarningRef.current = false
        setIsWarningVisible(false)
        clearInterval(checkInterval)
        onLogout?.()
        return
      }

      // 2. Waktu inaktivitas memasuki fase peringatan (55 Menit)
      if (idleTime >= timeoutMs - warningMs) {
        const remaining = Math.max(0, Math.ceil((timeoutMs - idleTime) / 1000))
        isWarningRef.current = true
        setIsWarningVisible(true)
        setRemainingSeconds(remaining)
      } else if (isWarningRef.current) {
        isWarningRef.current = false
        setIsWarningVisible(false)
      }
    }, 1000)

    return () => {
      clearInterval(checkInterval)
    }
  }, [enabled, timeoutMs, warningMs, onLogout])

  return {
    isWarningVisible,
    remainingSeconds,
    resetTimer,
    wasActiveRecently,
  }
}

export default useIdleTimeout
