"use client"

import { useEffect } from "react"
import { getAnalytics, isSupported, logEvent } from "firebase/analytics"
import { app } from "@/lib/firebase"

interface AnalyticsTrackerProps {
  eventName: string
  eventParams?: {
    [key: string]: any
  }
}

export default function AnalyticsTracker({
  eventName,
  eventParams,
}: AnalyticsTrackerProps) {
  useEffect(() => {
    const trackEvent = async () => {
      const supported = await isSupported()

      if (supported) {
        const analyticsInstance = getAnalytics(app)
        
        if (eventParams) {
          logEvent(analyticsInstance, eventName, eventParams)
        } else {
          logEvent(analyticsInstance, eventName)
        }
      }
    }

    trackEvent()
  }, [eventName, eventParams])

  return null
}
