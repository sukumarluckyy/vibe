import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import Player from './components/Player';
import Library from './components/Library';
import { Song, Playlist } from './types';
import { searchSongs, checkHealth, getStreamUrl } from './services/api';
import { MOCK_SONGS, MOCK_STREAM_URL } from './services/mockData';
import { AudioWaveform, WifiOff, Sun, Moon, Home, Library as LibraryIcon, Menu, X } from 'lucide-react';

// SET THIS TO FALSE TO USE REAL API
const USE_MOCK_DATA = true;

type View = 'home' | 'library';

function App() {
  const [view, setView] = useState<View>('home');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Library State (Persisted)
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('vibe_liked');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<Song[]>(() => {
    const saved = localStorage.getItem('vibe_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('vibe_playlists');
    return saved ? JSON.parse(saved) : [];
  });

  // Effects for Persistence
  useEffect(() => localStorage.setItem('vibe_liked', JSON.stringify(likedSongs)), [likedSongs]);
  useEffect(() => localStorage.setItem('vibe_history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('vibe_playlists', JSON.stringify(playlists)), [playlists]);

  // Initialize Theme (Target documentElement for <html> tag)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Check API health on mount
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setApiReady(true);
      return;
    }
    checkHealth().then(setApiReady);
  }, []);

  // Fetch Stream URL when current song changes
  useEffect(() => {
    if (!currentSong) {
      setCurrentStreamUrl('');
      return;
    }

    // Reset URL to prevent playing previous song while fetching new one
    setCurrentStreamUrl('');

    if (USE_MOCK_DATA) {
      setCurrentStreamUrl(MOCK_STREAM_URL);
      return;
    }

    let isMounted = true;
    getStreamUrl(currentSong.id).then((url) => {
      if (isMounted && url) {
        setCurrentStreamUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setView('home'); // Switch to home on search
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = MOCK_SONGS.filter(
          song => 
            song.title.toLowerCase().includes(lowerQuery) || 
            song.artists.toLowerCase().includes(lowerQuery)
        );
        setSearchResults(results);
        setIsLoading(false);
      }, 500);
    } else {
      const results = await searchSongs(query);
      setSearchResults(results);
      setIsLoading(false);
    }
  }, []);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    // Add to history if not first item
    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  const handleToggleLike = (song: Song) => {
    setLikedSongs(prev => {
      const isLiked = prev.some(s => s.id === song.id);
      if (isLiked) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [song, ...prev];
      }
    });
  };

  const handleCreatePlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      createdAt: Date.now()
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleAddToPlaylist = (song: Song, playlistId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        // Avoid duplicates
        if (pl.songs.some(s => s.id === song.id)) return pl;
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    }));
    alert(`Added "${song.title}" to playlist!`);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const sourceList = searchResults.length > 0 ? searchResults : MOCK_SONGS;
    const currentIndex = sourceList.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % sourceList.length;
    handlePlay(sourceList[nextIndex]);
  };

  const handlePrev = () => {
    if (!currentSong) return;
    const sourceList = searchResults.length > 0 ? searchResults : MOCK_SONGS;
    const currentIndex = sourceList.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + sourceList.length) % sourceList.length;
    handlePlay(sourceList[prevIndex]);
  };

  if (apiReady === false) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
         <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '50%' }}>
            <WifiOff size={32} color="#ef4444" />
         </div>
         <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Connection Error</h1>
         <p style={{ color: '#666' }}>
           Could not connect to the Music API. Ensure localhost:4000 is running.
         </p>
      </div>
    );
  }

  const isCurrentLiked = currentSong ? likedSongs.some(s => s.id === currentSong.id) : false;

  return (
    <div className="app-container">
      
      {/* Floating Header */}
      <header className="app-header">
        <div className="header-content">
          
          {/* Left: Logo */}
          <div className="header-left">
            <div className="logo">
              <AudioWaveform size={24} color="var(--primary-color)" />
              <span className="logo-text">vibe</span>
            </div>
          </div>

          {/* Center: Nav Group (Desktop only) */}
          <div className="header-center nav-group-desktop">
            <button 
              className={`nav-btn ${view === 'home' ? 'active' : ''}`}
              onClick={() => setView('home')}
            >
              <Home size={18} />
              <span className="nav-label">Home</span>
            </button>

            <button 
              className={`nav-btn ${view === 'library' ? 'active' : ''}`}
              onClick={() => setView('library')}
            >
              <LibraryIcon size={18} />
              <span className="nav-label">Library</span>
            </button>
          </div>

          {/* Right: Search + Theme + Mobile Menu */}
          <div className="header-right">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            
            <button onClick={toggleTheme} className="theme-toggle desktop-only" aria-label="Toggle Theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              className="hamburger-btn mobile-only"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown">
             <button 
              className={`mobile-menu-item ${view === 'home' ? 'active' : ''}`}
              onClick={() => { setView('home'); setIsMobileMenuOpen(false); }}
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <button 
              className={`mobile-menu-item ${view === 'library' ? 'active' : ''}`}
              onClick={() => { setView('library'); setIsMobileMenuOpen(false); }}
            >
              <LibraryIcon size={20} />
              <span>Library</span>
            </button>
            <div className="mobile-menu-divider"></div>
            <button 
              className="mobile-menu-item"
              onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="main-container">
        
        {view === 'home' && (
          <>
            {searchResults.length === 0 && !isLoading ? (
              <div className="hero-section">
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'10px'}}>
                  <AudioWaveform size={40} color="var(--primary-color)" />
                </div>
                <h1 className="hero-title">
                  Find your vibe.
                </h1>
                <p className="hero-subtitle">
                  Search for your favorite tracks above and start listening instantly.
                </p>

                {/* Show Liked Songs Preview on Home if available */}
                {likedSongs.length > 0 && (
                  <div style={{ marginTop: '40px', textAlign: 'left' }}>
                    <h3 className="section-title">Your Favorites</h3>
                    <SongList 
                      songs={likedSongs.slice(0, 4)} 
                      currentSong={currentSong} 
                      isPlaying={!isFullScreen && !!currentSong} 
                      onPlay={handlePlay}
                      onAddToPlaylist={handleAddToPlaylist}
                      playlists={playlists}
                      viewMode="grid" // Preview in grid
                    />
                    <button 
                      onClick={() => setView('library')}
                      style={{ marginTop: '20px', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                    >
                      View all favorites →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="content-area">
                <div className="results-header">
                  <h2 className="section-title">
                    {isLoading ? 'Searching...' : 'Results'}
                  </h2>
                </div>
                
                <SongList 
                  songs={searchResults} 
                  currentSong={currentSong} 
                  isPlaying={!isFullScreen && !!currentSong} 
                  onPlay={handlePlay} 
                  onAddToPlaylist={handleAddToPlaylist}
                  playlists={playlists}
                  viewMode="list"
                />
              </div>
            )}
          </>
        )}

        {view === 'library' && (
          <Library 
            history={history}
            likedSongs={likedSongs}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={!isFullScreen && !!currentSong}
            onPlay={handlePlay}
            onCreatePlaylist={handleCreatePlaylist}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
      </main>

      {/* Player (Mini and Full Screen) */}
      <Player 
        currentSong={currentSong} 
        streamUrl={currentStreamUrl}
        onNext={handleNext} 
        onPrev={handlePrev}
        isFullScreen={isFullScreen}
        onOpenFullScreen={() => setIsFullScreen(true)}
        onCloseFullScreen={() => setIsFullScreen(false)}
        onToggleLike={handleToggleLike}
        isLiked={isCurrentLiked}
      />
    </div>
  );
}

export default App;