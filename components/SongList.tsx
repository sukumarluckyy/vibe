import React from 'react';
import { Play, BarChart2 } from 'lucide-react';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
}

const SongList: React.FC<SongListProps> = ({ songs, currentSong, isPlaying, onPlay }) => {
  if (songs.length === 0) {
    // Only show if we actually searched and found nothing is handled by parent or different state, 
    // but here we just render empty or nothing. 
    // Parent handles empty state view for initial load.
    return null;
  }

  return (
    <div className="space-y-2 w-full max-w-4xl mx-auto">
      {songs.map((song) => {
        const isCurrent = currentSong?.id === song.id;
        
        return (
          <div
            key={song.id}
            onClick={() => onPlay(song)}
            className={`group flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent
              ${isCurrent 
                ? 'bg-primary-500/10 border-primary-500/20' 
                : 'hover:bg-gray-100 dark:hover:bg-dark-800 hover:border-gray-200 dark:hover:border-dark-700'
              }`}
          >
            {/* Thumbnail */}
            <div className="relative h-12 w-12 flex-shrink-0 mr-4">
              <img
                src={song.thumbnail}
                alt={song.title}
                className={`h-full w-full object-cover rounded-md shadow-sm ${isCurrent && isPlaying ? 'opacity-50' : ''}`}
              />
              <div className={`absolute inset-0 flex items-center justify-center ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                 {isCurrent && isPlaying ? (
                   <BarChart2 className="w-5 h-5 text-white drop-shadow-md animate-pulse" />
                 ) : (
                   <Play className="w-5 h-5 text-white drop-shadow-md fill-current" />
                 )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium truncate ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-200'}`}>
                {song.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                {song.artists}
              </p>
            </div>

            {/* Duration */}
            <div className="ml-4 text-xs text-gray-400 dark:text-gray-500 font-mono">
              {song.duration}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;