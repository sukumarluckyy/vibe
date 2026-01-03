export interface Song {
  id: string;
  title: string;
  artists: string;
  thumbnail: string;
  duration: string; // The search API returns duration as a string "MM:SS"
}

export interface SongDetail {
  id: string;
  title: string;
  duration: number; // The info API returns number
  viewCount: number;
  channel: string;
  thumbnails: { url: string; width: number; height: number }[];
}

export type PlayMode = 'sequence' | 'shuffle' | 'repeat';
