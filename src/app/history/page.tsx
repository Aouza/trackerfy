'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { RecentTrackItem } from 'src/types/spotify'
import { TimeAgo } from 'src/components/TimeAgo'
import Image from 'next/image'

export default function History() {
  const { data: session } = useSession()
  const [recentTracks, setRecentTracks] = useState<RecentTrackItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.accessToken) {
      fetchRecentTracks()
    }
  }, [session])

  async function fetchRecentTracks() {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      })
      const data = await res.json()
      setRecentTracks(data.items || [])
    } catch (error) {
      console.error('Error fetching recent tracks:', error)
    }
    setLoading(false)
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-zinc-400">Faça login para ver seu histórico</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Seu Histórico</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {recentTracks.length > 0 ? (
            recentTracks.map((item) => (
              <div key={item.played_at} className="bg-zinc-900/50 hover:bg-zinc-900 transition-colors rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.track.album.images[0].url}
                    alt={item.track.name}
                    width={48}
                    height={48}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm text-white truncate">{item.track.name}</p>
                      <p className="text-xs text-zinc-500 shrink-0">
                        <TimeAgo date={item.played_at} />
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">
                      {item.track.artists.map(artist => artist.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-400 text-center py-20">
              Nenhuma música no histórico.
            </p>
          )}
        </div>
      )}
    </div>
  )
} 