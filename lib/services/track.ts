import { prisma } from '../prisma'

export async function updateNowPlaying(userId: string, trackData: {
  spotifyId: string
  name: string
  artist: string
  albumName: string
  albumImage: string
}) {
  // Primeiro, cria a nova track
  const track = await prisma.track.create({
    data: {
      ...trackData,
      user: {
        connect: { id: userId }
      }
    }
  })

  // Atualiza o nowPlaying do usuário
  await prisma.user.update({
    where: { id: userId },
    data: {
      nowPlayingId: track.id
    }
  })

  return track
} 