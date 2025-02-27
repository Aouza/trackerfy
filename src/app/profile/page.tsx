'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

interface SpotifyProfile {
  id: string
  display_name: string
  images: { url: string }[]
  followers: {
    total: number
  }
  country: string
}

interface TopArtist {
  id: string
  name: string
  images: { url: string }[]
}

interface TopTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
}

async function getProfile(accessToken: string): Promise<SpotifyProfile> {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return res.json()
}

async function getTopArtists(accessToken: string): Promise<TopArtist[]> {
  const res = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const data = await res.json()
  return data.items
}

async function getTopTracks(accessToken: string): Promise<TopTrack[]> {
  const res = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const data = await res.json()
  return data.items
}

export default function Profile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<SpotifyProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [topArtists, setTopArtists] = useState<TopArtist[]>([])
  const [topTracks, setTopTracks] = useState<TopTrack[]>([])

  const fetchProfile = useCallback(async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      const [profileData, artists, tracks] = await Promise.all([
        getProfile(session.accessToken),
        getTopArtists(session.accessToken),
        getTopTracks(session.accessToken)
      ])
      setProfile(profileData)
      setTopArtists(artists)
      setTopTracks(tracks)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }, [session?.accessToken])

  useEffect(() => {
    if (session?.accessToken) {
      fetchProfile()
    }
  }, [session?.accessToken, fetchProfile])

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-zinc-400">Faça login para ver seu perfil</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
        </div>
      ) : profile ? (
        <>
          {/* Cabeçalho do Perfil */}
          <div className="flex items-center gap-6">
            {profile.images?.[0]?.url ? (
              <Image
                src={profile.images[0].url}
                alt={profile.display_name}
                width={128}
                height={128}
                className="rounded-full"
              />
            ) : (
              <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center">
                <span className="text-4xl text-zinc-500">
                  {profile?.display_name?.[0] || '?'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.display_name}
              </h1>
              <p className="text-zinc-400">
                {profile?.followers?.total} seguidores
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Artistas */}
            <div className="bg-zinc-900/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Top Artistas</h3>
              <div className="space-y-4">
                {topArtists?.length > 0 ? (
                  topArtists.map((artist) => (
                    <div key={artist.id} className="flex items-center gap-3">
                      <Image
                        src={artist.images[0].url}
                        alt={artist.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <span className="text-zinc-200">{artist.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400">Nenhum artista encontrado</p>
                )}
              </div>
            </div>

            {/* Top Músicas */}
            <div className="bg-zinc-900/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Top Músicas</h3>
              <div className="space-y-4">
                {topTracks?.length > 0 ? (
                  topTracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-3">
                      <Image
                        src={track.album.images[0].url}
                        alt={track.name}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 truncate">{track.name}</p>
                        <p className="text-sm text-zinc-400 truncate">
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400">Nenhuma música encontrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Logout */}
          <div className="pt-4">
            <button
              onClick={() => signOut()}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sair do Spotify
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
} 