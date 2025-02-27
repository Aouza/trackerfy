import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from 'src/lib/prisma'
import { authOptions } from 'src/lib/auth'
import { PrismaClient } from '@prisma/client'

interface SpotifyArtist {
  name: string
}

interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: {
    name: string
    images: { url: string }[]
  }
}

interface SpotifyResponse {
  item: SpotifyTrack
  is_playing: boolean
  progress_ms: number
  timestamp: number
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    console.log('No access token found')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Primeiro, busca o usuário para garantir que temos o ID correto
    const currentUser = await prisma.user.findUnique({
      where: { spotifyId: session.user.id }
    })

    if (!currentUser) {
      console.log('User not found:', session.user.id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Fetching currently playing from Spotify...')
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Spotify API response status:', res.status)

    if (res.status === 204) {
      console.log('No track currently playing')
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { nowPlayingId: null }
      })
      return NextResponse.json(null)
    }

    const data = await res.json() as SpotifyResponse
    console.log('Spotify API response data:', data)

    if (!data?.item) {
      console.log('No track data found')
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { nowPlayingId: null }
      })
      return NextResponse.json(null)
    }

    try {
      const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$transaction'>) => {
        console.log('Creating track in database...')
        const track = await tx.track.create({
          data: {
            spotifyId: data.item.id,
            name: data.item.name,
            artist: data.item.artists.map((a: SpotifyArtist) => a.name).join(', '),
            albumName: data.item.album.name,
            albumImage: data.item.album.images[0].url,
            playedAt: new Date(),
            user: {
              connect: { id: currentUser.id }
            }
          }
        })

        console.log('Updating user with new track...')
        await tx.user.update({
          where: { id: currentUser.id },
          data: {
            nowPlayingId: track.id
          }
        })

        return { track }
      })

      console.log('Successfully updated currently playing')
      return NextResponse.json(result.track)
    } catch (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }
  } catch (error) {
    console.error('Error in currently-playing route:', error)
    return NextResponse.json({ 
      error: 'Failed to update currently playing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 