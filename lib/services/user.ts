import { prisma } from '../prisma'

export async function followUser(userId: string, followingId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      following: {
        connect: { id: followingId }
      }
    }
  })
}

export async function unfollowUser(userId: string, followingId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      following: {
        disconnect: { id: followingId }
      }
    }
  })
}

export async function getFeed(userId: string) {
  return await prisma.user.findMany({
    where: {
      followedBy: {
        some: { id: userId }
      }
    },
    select: {
      id: true,
      name: true,
      image: true,
      nowPlaying: {
        select: {
          id: true,
          name: true,
          artist: true,
          albumName: true,
          albumImage: true,
          playedAt: true
        }
      }
    }
  })
}

export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      playHistory: {
        orderBy: {
          playedAt: 'desc'
        },
        take: 50, // Limita a 50 músicas mais recentes
        select: {
          id: true,
          name: true,
          artist: true,
          albumName: true,
          albumImage: true,
          playedAt: true
        }
      },
      nowPlaying: {
        select: {
          id: true,
          name: true,
          artist: true,
          albumName: true,
          albumImage: true,
          playedAt: true
        }
      },
      _count: {
        select: {
          following: true,
          followedBy: true
        }
      }
    }
  })
}

export async function isFollowing(userId: string, targetUserId: string) {
  const count = await prisma.user.count({
    where: {
      id: userId,
      following: {
        some: { id: targetUserId }
      }
    }
  })
  return count > 0
} 