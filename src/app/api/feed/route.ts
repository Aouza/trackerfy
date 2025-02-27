import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from 'src/lib/prisma'
import { authOptions } from 'src/lib/auth'

// Mock de amigos para teste
const MOCK_FRIENDS = [
  {
    id: '1',
    name: 'João Silva',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=João',
    track: {
      id: 'track1',
      name: 'Bohemian Rhapsody',
      artists: [{ name: 'Queen' }],
      album: {
        name: 'A Night at the Opera',
        images: [{ 
          url: 'https://i.scdn.co/image/ab67616d0000b273365b3fb800c19f7ff72602da'
        }]
      },
      started_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    name: 'Maria Santos',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    track: {
      id: 'track2',
      name: 'Shape of You',
      artists: [{ name: 'Ed Sheeran' }],
      album: {
        name: '÷',
        images: [{ 
          url: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'
        }]
      },
      started_at: new Date().toISOString()
    }
  }
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Busca o usuário atual com sua música atual
    const user = await prisma.user.findUnique({
      where: { spotifyId: session.user.id },
      include: {
        nowPlaying: true
      }
    })

    if (!user) {
      return NextResponse.json([])
    }

    // Formata o feed com sua música e os mocks de amigos
    const feed = [
      // Sua música atual
      {
        id: 'me',
        user: {
          id: 'me',
          name: 'Você',
          image: user.image
        },
        track: user.nowPlaying ? {
          id: user.nowPlaying.spotifyId,
          name: user.nowPlaying.name,
          artists: [{ name: user.nowPlaying.artist }],
          album: {
            name: user.nowPlaying.albumName,
            images: [{ url: user.nowPlaying.albumImage }]
          },
          started_at: user.nowPlaying.playedAt.toISOString()
        } : null,
        timestamp: user.nowPlaying?.playedAt.toISOString()
      },
      
      // Mocks de amigos
      ...MOCK_FRIENDS.map(friend => ({
        id: friend.id,
        user: {
          id: friend.id,
          name: friend.name,
          image: friend.image
        },
        track: friend.track,
        timestamp: friend.track.started_at
      }))
    ]

    return NextResponse.json(feed)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json([])
  }
} 