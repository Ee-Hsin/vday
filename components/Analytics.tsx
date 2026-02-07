// components/Analytics.tsx
"use client"

import { useEffect } from "react"
import { analytics } from "@/lib/firebase"
import { logEvent } from "firebase/analytics"
import { usePathname } from "next/navigation"

interface Analytics {
  logEvent: (eventName: string, params: { [key: string]: any }) => void
}

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!analytics) return // If analytics isn't initialized, do nothing

    // Log a page view event whenever the route changes.
    logEvent(analytics, "page_view", { page_path: pathname })
  }, [pathname])

  return null
}
