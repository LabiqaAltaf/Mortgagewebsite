import { useEffect, useState } from 'react'

/**
 * Fetches a public list endpoint (team / testimonials / lenders) and swaps
 * it in once loaded. Starts with the given fallback (from websiteData.js)
 * so the section renders immediately and never shows blank/broken content
 * if the API or database is temporarily unavailable.
 *
 * @param {() => Promise<{ success: boolean, data: any[] }>} fetcher
 * @param {any[]} fallback
 */
export default function usePublicList(fetcher, fallback) {
  const [items, setItems] = useState(fallback)

  useEffect(() => {
    let cancelled = false

    fetcher()
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res?.data) ? res.data : null
        // Only replace the fallback once we actually have admin-managed
        // records; an empty DB collection should not blank the section.
        if (list && list.length > 0) setItems(list)
      })
      .catch(() => {
        // Keep showing the fallback content silently — a visitor should
        // never see a broken section just because the backend/DB is down.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return items
}
