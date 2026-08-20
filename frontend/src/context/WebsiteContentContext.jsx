import { createContext, useContext, useEffect, useState } from 'react'
import { getPublicContent } from '../api/client.js'
import {
  hero,
  reviews,
  reviewStats,
  stepsHeading,
  steps,
  approachHeading,
  approachWords,
  approachCta,
  badCredit,
  reasonsHeading,
  reasons,
  websiteImages,
  learnMore,
} from '../data/websiteData.js'

/**
 * Admin-editable public content (Hero, Trust/Reviews, How It Works,
 * Approach, Bad Credit, Reasons) fetched once from GET /api/content/public
 * and shared across the sections that render it.
 *
 * Starts from the static websiteData.js defaults so the page renders
 * immediately with no blank flash, then silently swaps in the saved
 * MongoDB values once they load. If the API/DB is unavailable, it just
 * keeps the defaults — the public site never breaks or shows blank content.
 */
const WebsiteContentContext = createContext(null)

const FALLBACK_CONTENT = {
  hero,
  reviews,
  reviewStats,
  stepsHeading,
  steps,
  approachHeading,
  approachWords,
  approachCta,
  badCredit,
  reasonsHeading,
  reasons,
  websiteImages,
  learnMore,
}

export function WebsiteContentProvider({ children }) {
  const [content, setContent] = useState(FALLBACK_CONTENT)

  useEffect(() => {
    let cancelled = false

    getPublicContent()
      .then((res) => {
        if (cancelled || !res?.content) return
        // Merge onto the defaults key-by-key so a partially-filled DB
        // (e.g. only the hero has been edited so far) never blanks out
        // sections that haven't been saved by the admin yet.
        setContent((prev) => ({ ...prev, ...res.content }))
      })
      .catch(() => {
        // Keep the fallback content silently.
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <WebsiteContentContext.Provider value={content}>
      {children}
    </WebsiteContentContext.Provider>
  )
}

export function useWebsiteContent() {
  const ctx = useContext(WebsiteContentContext)
  // Allow use outside the provider too (returns static defaults) so no
  // component ever crashes if it's rendered without the wrapper.
  return ctx || FALLBACK_CONTENT
}
