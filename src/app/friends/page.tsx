'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Search } from 'lucide-react'

interface SpotifyUser {
  id: string
  display_name: string
  images: { url: string }[]
  followers: { total: number }
}

async function getFollowing(accessToken: string): Promise<SpotifyUser[]> {
  const res = await fetch('https://api.spotify.com/v1/me/following?type=user&limit=50', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const data = await res.json()
  return data?.artists?.items || []
}

export default function Friends() {
  const { data: session } = useSession()
  const [following, setFollowing] = useState<SpotifyUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.accessToken) {
      loadFollowing()
    }
  }, [session])

  async function loadFollowing() {
    if (!session?.accessToken) return
    try {
      const users = await getFollowing(session.accessToken)
      setFollowing(users)
    } catch (error) {
      console.error('Error loading following:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Amigos</h1>
      </div>

      {/* Mensagem sobre limitação do Spotify */}
      <div className="bg-zinc-900/50 p-4 rounded-lg">
        <p className="text-zinc-400">
          O Spotify não permite buscar usuários diretamente. 
          Para conectar com amigos, compartilhe seu perfil com eles.
        </p>
      </div>

      {/* Lista de quem você segue */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-white">Seguindo</h2>
        {following.map((user) => (
          <div key={user.id} className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              {user.images?.[0]?.url ? (
                <Image
                  src={user.images[0].url}
                  alt={user.display_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-xl text-zinc-500">
                    {user.display_name[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-medium">{user.display_name}</p>
                <p className="text-sm text-zinc-400">
                  {user.followers.total} seguidores
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 