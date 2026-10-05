'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

interface TrackEventProps {
  event: string
  data?: Record<string, unknown>
}

export default function TrackEvent({ event, data }: TrackEventProps) {
  useEffect(() => {
    trackEvent(event, data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
