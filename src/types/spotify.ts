export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyAlbum {
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: { url: string }[];
  };
  started_at?: string;
}

export interface RecentTrackItem {
  track: SpotifyTrack;
  played_at: string;
} 