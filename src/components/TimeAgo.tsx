'use client'
import { useEffect, useState } from 'react'

function formatTimeAgo(date: Date) {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'agora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    function updateTime() {
      setTimeAgo(formatTimeAgo(new Date(date)))
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [date])

  return <span>{timeAgo}</span>
} 