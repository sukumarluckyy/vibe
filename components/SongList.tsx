import React, { useState } from 'react';
import { Play, BarChart2, MoreVertical } from 'lucide-react';
import { Song, Playlist } from '../types';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onAddToPlaylist?: (song: Song, playlistId: string) => void;
  playlists?: Playlist[];
  viewMode?: 'list' | 'grid';
}

const SongList: React.FC<SongListProps> = ({ 
  songs, 
  currentSong, 
  isPlaying, 
  onPlay, 
  onAddToPlaylist,
  playlists = [],
  viewMode = 'list'
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (songs.length === 0) {
    return null;
  }

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, song: Song, playlistId: string) => {
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist(song, playlistId);
      setActiveMenuId(null);
    }
  };

  return (
    <div className={`song-list ${viewMode === 'grid' ? 'grid-view' : ''}`}>
      {songs.map((song) => {
        const isCurrent = currentSong?.id === song.id;
        const isMenuOpen = activeMenuId === song.id;
        
        return (
          <div
            key={song.id}
            className={`song-item ${isCurrent ? 'active' : ''}`}
          >
            <div className="song-main-click-area" onClick={() => onPlay(song)}>
              {/* Thumbnail */}
              <div className="song-thumbnail-wrapper">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="song-thumbnail"
                />
                <div className="song-overlay">
                   {isCurrent && isPlaying ? (
                     <BarChart2 size={24} color="white" />
                   ) : (
                     <Play size={24} color="white" fill="white" />
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
            </div>

            {/* Actions (Only in List Mode normally, or positioned differently in Grid) */}
            <div className="song-actions">
              {viewMode === 'list' && (
                <span className="song-duration" style={{ marginRight: '8px' }}>
                  {song.duration}
                </span>
              )}
              
              {onAddToPlaylist && (
                <div style={{ position: 'relative' }}>
                  <button 
                    className={`song-action-btn ${isMenuOpen ? 'active' : ''}`}
                    onClick={(e) => toggleMenu(e, song.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="song-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                       <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                         Add to Playlist
                       </div>
                       {playlists.length > 0 ? (
                         playlists.map(pl => (
                           <button 
                             key={pl.id} 
                             className="menu-item"
                             onClick={(e) => handleAddToPlaylist(e, song, pl.id)}
                           >
                             {pl.name}
                           </button>
                         ))
                       ) : (
                         <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                           No playlists created
                         </div>
                       )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;