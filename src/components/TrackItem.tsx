import Image from 'next/image'
import { SpotifyTrack } from 'src/types/spotify'

interface TrackItemProps {
  track: SpotifyTrack
  size?: number
  className?: string
}

export function TrackItem({ track, size = 100, className = '' }: TrackItemProps) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-zinc-900 rounded-lg ${className}`}>
      <Image
        src={track.album.images[0]?.url}
        alt={track.name}
        width={size}
        height={size}
        className="rounded-lg"
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">
          {track.name}
        </h3>
        <p className="text-sm text-zinc-400">
          {track.artists.map(artist => artist.name).join(', ')}
        </p>
      </div>
    </div>
  )
} 