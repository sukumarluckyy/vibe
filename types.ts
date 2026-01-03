export interface Song {
  id: string;
  title: string;
  artists: string;
  thumbnail: string;
  duration: string;
}

export interface SongDetail {
  id: string;
  title: string;
  duration: number;
  viewCount: number;
  channel: string;
  thumbnails: { url: string; width: number; height: number }[];
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export type PlayMode = 'sequence' | 'shuffle' | 'repeat' | 'loop-one';