import { Song } from '../types';

export const MOCK_SONGS: Song[] = [
  {
    id: 'mock-1',
    title: 'Neon Lights',
    artists: 'Synthwave Boy',
    thumbnail: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
    duration: '3:45'
  },
  {
    id: 'mock-2',
    title: 'Night Drive',
    artists: 'Future Cop',
    thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop',
    duration: '4:20'
  },
  {
    id: 'mock-3',
    title: 'Cyberpunk City',
    artists: 'Retrowave Legends',
    thumbnail: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop',
    duration: '3:10'
  },
  {
    id: 'mock-4',
    title: 'Digital Dreams',
    artists: 'Pixel Sound',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    duration: '2:55'
  },
  {
    id: 'mock-5',
    title: 'Sunset Highway',
    artists: 'Vapor Soul',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    duration: '3:30'
  }
];

// Using a reliable MP3 sample for testing
export const MOCK_STREAM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';