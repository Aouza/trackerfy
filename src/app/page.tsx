'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Image from 'next/image'
import { TimeAgo } from 'src/components/TimeAgo'
import { usePolling } from 'src/hooks/usePolling'

interface FeedItem {
  id: string
  user: {
    id: string
    name: string
    image?: string
  }
  track: {
    id: string
    name: string
    artists: { name: string }[]
    album: {
      name: string
      images: { url: string }[]
    }
    started_at: string
  } | null
  timestamp: string | null
}

export default function Feed() {
  const { data: session } = useSession()
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFeed = useCallback(async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      await fetch('/api/currently-playing')
      const res = await fetch('/api/feed')
      const data = await res.json()
      if (Array.isArray(data)) {
        setFeed(data)
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    }
    setLoading(false)
  }, [session?.accessToken])

  useEffect(() => {
    if (session?.accessToken) {
      fetchFeed()
    }
  }, [session?.accessToken, fetchFeed])

  usePolling(() => {
    if (session?.accessToken) {
      fetchFeed()
    }
  }, 60000)

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <button
          onClick={() => signIn('spotify')}
          className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
        >
          Login com Spotify
        </button>
      </div>
    )
  }

  const myFeed = feed.find(item => item.user.id === 'me')
  const friendsFeed = feed.filter(item => item.user.id !== 'me')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Sua música atual - Destacada */}
      {myFeed?.track && (
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 relative shrink-0">
              <Image 
                src={myFeed.user.image || '/default-avatar.png'} 
                alt="Você"
                fill
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
            <p className="text-zinc-400 text-sm">
              Você está ouvindo • <TimeAgo date={myFeed.track.started_at} />
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[180px] h-[180px] relative shrink-0">
              <Image
                src={myFeed.track.album.images[0].url}
                alt={myFeed.track.name}
                fill
                className="rounded-lg object-cover"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{myFeed.track.name}</h3>
              <p className="text-zinc-400">{myFeed.track.artists.map(a => a.name).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feed dos amigos */}
      <div className="space-y-3">
        <h2 className="text-zinc-400 text-sm font-medium px-2">Amigos ouvindo</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : friendsFeed.length > 0 ? (
          <div className="space-y-2">
            {friendsFeed.map((item) => (
              <div key={item.id} className="bg-zinc-900/50 hover:bg-zinc-900 transition-colors rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 relative shrink-0">
                    <Image 
                      src={item.user.image || '/default-avatar.png'}
                      alt={item.user.name}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {item.user.name}
                      </p>
                      {item.track && (
                        <p className="text-xs text-zinc-500">
                          <TimeAgo date={item.track.started_at} />
                        </p>
                      )}
                    </div>
                    {item.track ? (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-12 h-12 relative shrink-0">
                          <Image
                            src={item.track.album.images[0].url}
                            alt={item.track.name}
                            fill
                            className="rounded object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.track.name}</p>
                          <p className="text-xs text-zinc-400 truncate">
                            {item.track.artists.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">Nenhuma música tocando</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-zinc-500">
            Nenhum amigo está ouvindo música no momento
          </p>
        )}
      </div>
    </div>
  )
}
