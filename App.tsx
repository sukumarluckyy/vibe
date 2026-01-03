import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import Player from './components/Player';
import { Song } from './types';
import { searchSongs, checkHealth, getStreamUrl } from './services/api';
import { MOCK_SONGS, MOCK_STREAM_URL } from './services/mockData';
import { AudioWaveform, WifiOff, Sun, Moon } from 'lucide-react';

// SET THIS TO FALSE TO USE REAL API
const USE_MOCK_DATA = true;

function App() {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Initialize Theme
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
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

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    if (USE_MOCK_DATA) {
      // Simulate network delay for realistic feel
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
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!currentSong || searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % searchResults.length;
    setCurrentSong(searchResults[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (!currentSong || searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSong(searchResults[prevIndex]);
    setIsPlaying(true);
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

  // Determine the correct stream URL based on mode
  const currentStreamUrl = currentSong 
    ? (USE_MOCK_DATA ? MOCK_STREAM_URL : getStreamUrl(currentSong.id)) 
    : '';

  return (
    <div className="app-container">
      
      {/* Floating Header */}
      <header className="app-header">
        <div className="header-content">
          
          {/* Logo */}
          <div className="logo">
            <AudioWaveform size={24} />
            <span>vibe</span>
          </div>

          {/* Search */}
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {searchResults.length === 0 && !isLoading && (
          <div className="hero-section">
            <h1 className="hero-title">
              Find your vibe.
            </h1>
            <p className="hero-subtitle">
              Search for your favorite tracks above and start listening instantly.
            </p>
          </div>
        )}

        {/* Results/List */}
        <div className="content-area">
          {(searchResults.length > 0 || isLoading) && (
            <div className="results-header">
              <h2 className="results-title">
                {isLoading ? 'Searching...' : 'Results'}
              </h2>
               {searchResults.length > 0 && !isLoading && (
                 <span className="results-count">
                   {searchResults.length} tracks
                 </span>
               )}
            </div>
          )}
          
          <SongList 
            songs={searchResults} 
            currentSong={currentSong} 
            isPlaying={isPlaying} 
            onPlay={handlePlay} 
          />
        </div>
      </main>

      {/* Player Overlay */}
      <Player 
        currentSong={currentSong} 
        streamUrl={currentStreamUrl}
        onNext={handleNext} 
        onPrev={handlePrev}
      />
    </div>
  );
}

export default App;