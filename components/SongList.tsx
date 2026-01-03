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
    return null;
  }

  return (
    <div className="song-list">
      {songs.map((song) => {
        const isCurrent = currentSong?.id === song.id;
        
        return (
          <div
            key={song.id}
            onClick={() => onPlay(song)}
            className={`song-item ${isCurrent ? 'active' : ''}`}
          >
            {/* Thumbnail */}
            <div className="song-thumbnail-wrapper">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="song-thumbnail"
              />
              <div className="song-overlay">
                 {isCurrent && isPlaying ? (
                   <BarChart2 size={20} color="white" />
                 ) : (
                   <Play size={20} color="white" fill="white" />
                 )}
              </div>
            </div>

            {/* Info */}
            <div className="song-info">
              <h3 className="song-title">
                {song.title}
              </h3>
              <p className="song-artist">
                {song.artists}
              </p>
            </div>

            {/* Duration */}
            <div className="song-duration">
              {song.duration}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;