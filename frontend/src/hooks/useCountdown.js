import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Counts down from `initialSeconds`.
 * Calls `onExpire` when it hits zero.
 * Returns { secsLeft, pct, urgent, stop }.
 */
export function useCountdown(initialSeconds, onExpire) {
  const [secsLeft, setSecsLeft] = useState(initialSeconds)
  const intervalRef = useRef(null)
  const expiredRef = useRef(false)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (initialSeconds == null) return
    setSecsLeft(initialSeconds)
    expiredRef.current = false

    intervalRef.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire?.()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSeconds])

  const pct = initialSeconds ? (secsLeft / initialSeconds) * 100 : 100
  const urgent = secsLeft < 120

  return { secsLeft, pct, urgent, stop }
}

export function formatTime(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
