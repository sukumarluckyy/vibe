import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import SongList from './SongList';
import { Plus, ListMusic, Heart, History, ArrowLeft } from 'lucide-react';

interface LibraryProps {
  history: Song[];
  likedSongs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onCreatePlaylist: (name: string) => void;
  onAddToPlaylist: (song: Song, playlistId: string) => void;
}

type LibraryView = 'dashboard' | 'liked' | 'history' | 'playlists' | 'playlist-detail';

const Library: React.FC<LibraryProps> = ({
  history,
  likedSongs,
  playlists,
  currentSong,
  isPlaying,
  onPlay,
  onCreatePlaylist,
  onAddToPlaylist
}) => {
  const [view, setView] = useState<LibraryView>('dashboard');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const handleCreatePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt("Enter playlist name:");
    if (name) {
      onCreatePlaylist(name);
    }
  };

  const openPlaylist = (id: string) => {
    setActivePlaylistId(id);
    setView('playlist-detail');
  };

  const goBack = () => {
    if (view === 'playlist-detail') {
      setView('playlists');
      setActivePlaylistId(null);
    } else {
      setView('dashboard');
    }
  };

  // Dashboard View (Grid of pages)
  if (view === 'dashboard') {
    return (
      <div className="library-dashboard">
        <h2 className="section-title">Library</h2>
        <div className="dashboard-grid">
          {/* Liked Songs Card */}
          <div className="dashboard-card" onClick={() => setView('liked')}>
            <div className="card-icon-wrapper liked">
              <Heart size={32} fill="currentColor" />
            </div>
            <div className="card-info">
              <h3>Liked Songs</h3>
              <p>{likedSongs.length} songs</p>
            </div>
          </div>

          {/* Playlists Card */}
          <div className="dashboard-card" onClick={() => setView('playlists')}>
            <div className="card-icon-wrapper playlist">
              <ListMusic size={32} />
            </div>
            <div className="card-info">
              <h3>Playlists</h3>
              <p>{playlists.length} playlists</p>
            </div>
          </div>

          {/* History Card */}
          <div className="dashboard-card" onClick={() => setView('history')}>
            <div className="card-icon-wrapper history">
              <History size={32} />
            </div>
            <div className="card-info">
              <h3>History</h3>
              <p>{history.length} songs</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Header for Sub-pages
  const renderHeader = (title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <button onClick={goBack} className="back-btn">
        <ArrowLeft size={24} />
      </button>
      <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
    </div>
  );

  // Content for Sub-pages
  return (
    <div>
      {view === 'liked' && (
        <>
          {renderHeader("Liked Songs")}
          <SongList 
             songs={likedSongs}
             currentSong={currentSong}
             isPlaying={isPlaying}
             onPlay={onPlay}
             onAddToPlaylist={onAddToPlaylist}
             playlists={playlists}
             viewMode="grid"
           />
           {likedSongs.length === 0 && <p className="empty-state">No liked songs yet.</p>}
        </>
      )}

      {view === 'history' && (
        <>
          {renderHeader("History")}
          <SongList 
             songs={history}
             currentSong={currentSong}
             isPlaying={isPlaying}
             onPlay={onPlay}
             onAddToPlaylist={onAddToPlaylist}
             playlists={playlists}
             viewMode="grid"
           />
           {history.length === 0 && <p className="empty-state">No history yet.</p>}
        </>
      )}

      {view === 'playlists' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={goBack} className="back-btn"><ArrowLeft size={24} /></button>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Playlists</h2>
             </div>
             <button className="create-playlist-btn-small" onClick={handleCreatePlaylist}>
               <Plus size={18} /> New
             </button>
          </div>
          
          <div className="song-list grid-view">
             {playlists.map(pl => (
               <div key={pl.id} className="song-item" onClick={() => openPlaylist(pl.id)}>
                  <div className="song-thumbnail-wrapper" style={{ background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ListMusic size={32} color="var(--text-secondary)" />
                  </div>
                  <div className="song-info">
                    <h3 className="song-title">{pl.name}</h3>
                    <p className="song-artist">{pl.songs.length} songs</p>
                  </div>
               </div>
             ))}
             {playlists.length === 0 && <p className="empty-state">No playlists created.</p>}
           </div>
        </>
      )}

      {view === 'playlist-detail' && activePlaylistId && (
        <>
          {(() => {
            const pl = playlists.find(p => p.id === activePlaylistId);
            if (!pl) return null;
            return (
              <>
                {renderHeader(pl.name)}
                <SongList 
                  songs={pl.songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlay={onPlay}
                  viewMode="grid"
                />
                {pl.songs.length === 0 && <p className="empty-state">This playlist is empty.</p>}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default Library;