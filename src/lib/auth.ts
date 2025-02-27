import { AuthOptions } from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import { prisma } from 'src/lib/prisma'

interface SpotifyProfile {
  id: string
  display_name: string
  images?: { url: string }[]
  email: string
}

export const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'user-read-email',
            'user-read-private',
            'user-read-currently-playing',
            'user-read-recently-played',
            'user-read-playback-state',
            'user-top-read',
            'user-follow-read',
            'user-follow-modify'
          ].join(' ')
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET, // 🔥 ESSA LINHA É OBRIGATÓRIA EM 
  callbacks: {
    async signIn({ account, profile }) {
      try {
        if (!account || !profile) return false

        const spotifyProfile = profile as SpotifyProfile

        await prisma.user.upsert({
          where: { spotifyId: spotifyProfile.id },
          update: {
            name: spotifyProfile.display_name,
            image: spotifyProfile.images?.[0]?.url
          },
          create: {
            spotifyId: spotifyProfile.id,
            name: spotifyProfile.display_name,
            image: spotifyProfile.images?.[0]?.url
          }
        })

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, account, profile }) {
      if (profile && 'id' in profile) {
        token.id = (profile as SpotifyProfile).id
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.id = token.id as string
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
} 


