import { Song, SongDetail } from '../types';

const BASE_URL = 'http://localhost:4000';

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    return data.status === "YouTube Music API running";
  } catch (error) {
    console.error("Health check failed", error);
    return false;
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error("Search failed", error);
    return [];
  }
};

export const getSongInfo = async (id: string): Promise<SongDetail | null> => {
  try {
    const res = await fetch(`${BASE_URL}/info/${id}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error("Get info failed", error);
    return null;
  }
};

export const getStreamUrl = (id: string): string => {
  return `${BASE_URL}/stream/${id}`;
};
