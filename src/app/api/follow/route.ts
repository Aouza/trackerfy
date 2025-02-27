import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { targetUserId } = await req.json()
    
    // Busca o usuário atual pelo spotifyId
    const currentUser = await prisma.user.findUnique({
      where: { spotifyId: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Segue o usuário
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        following: {
          connect: { id: targetUserId }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { targetUserId } = await req.json()
    
    const currentUser = await prisma.user.findUnique({
      where: { spotifyId: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Deixa de seguir o usuário
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        following: {
          disconnect: { id: targetUserId }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 })
  }
} 