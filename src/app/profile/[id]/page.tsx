import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FollowButton } from '@/components/FollowButton'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { TimeAgo } from '@/components/TimeAgo'

export default async function UserProfile({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  // Busca o usuário e suas informações
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      nowPlaying: true,
      playHistory: {
        take: 20,
        orderBy: { playedAt: 'desc' }
      },
      _count: {
        select: {
          following: true,
          followedBy: true
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  // Verifica se o usuário atual segue este perfil
  const isFollowing = session?.user ? await prisma.user.count({
    where: {
      spotifyId: session.user.id,
      following: {
        some: { id: user.id }
      }
    }
  }) > 0 : false

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name}
            width={128}
            height={128}
            className="rounded-full"
          />
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {session?.user && session.user.id !== user.spotifyId && (
              <FollowButton
                targetUserId={user.id}
                initialIsFollowing={isFollowing}
              />
            )}
          </div>
          
          <div className="flex gap-4 mt-2 text-sm text-zinc-400">
            <span>{user._count.following} seguindo</span>
            <span>{user._count.followedBy} seguidores</span>
          </div>
        </div>
      </div>

      {/* Música atual */}
      {user.nowPlaying && (
        <div className="bg-zinc-900/50 rounded-lg p-4">
          <h2 className="text-sm text-zinc-400 mb-3">Ouvindo agora</h2>
          <div className="flex items-center gap-4">
            <Image
              src={user.nowPlaying.albumImage}
              alt={user.nowPlaying.name}
              width={64}
              height={64}
              className="rounded"
            />
            <div>
              <p className="font-medium">{user.nowPlaying.name}</p>
              <p className="text-sm text-zinc-400">{user.nowPlaying.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Histórico</h2>
        {user.playHistory.map((track) => (
          <div key={track.id} className="flex items-center gap-4 bg-zinc-900/30 p-3 rounded-lg">
            <Image
              src={track.albumImage}
              alt={track.name}
              width={48}
              height={48}
              className="rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{track.name}</p>
              <p className="text-sm text-zinc-400">{track.artist}</p>
            </div>
            <TimeAgo date={track.playedAt.toISOString()} />
          </div>
        ))}
      </div>
    </div>
  )
} 