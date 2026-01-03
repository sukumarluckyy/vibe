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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
           <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <WifiOff className="w-8 h-8 text-red-500" />
           </div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connection Error</h1>
           <p className="text-gray-500 dark:text-gray-400">
             Could not connect to the Music API. Please ensure the local server is running at <code className="bg-gray-200 dark:bg-dark-800 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">http://localhost:4000</code>.
           </p>
        </div>
      </div>
    );
  }

  // Determine the correct stream URL based on mode
  const currentStreamUrl = currentSong 
    ? (USE_MOCK_DATA ? MOCK_STREAM_URL : getStreamUrl(currentSong.id)) 
    : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white font-sans selection:bg-primary-500/30 transition-colors duration-300">
      
      {/* Floating Header */}
      <header className="fixed top-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-5xl pointer-events-auto bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-full shadow-lg px-4 py-2 flex items-center gap-4 transition-all duration-300">
          
          {/* Logo */}
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-dark-700">
            <div className="w-8 h-8 flex items-center justify-center">
              <AudioWaveform className="w-6 h-6 text-black dark:text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block text-black dark:text-white">vibe</span>
          </div>

          {/* Search */}
          <div className="flex-1">
             <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-32">
        {searchResults.length === 0 && !isLoading && (
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
              Find your vibe.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-lg mx-auto">
              Search for your favorite tracks above and start listening instantly.
            </p>
          </div>
        )}

        {/* Results/List */}
        <div className="mt-4">
          {(searchResults.length > 0 || isLoading) && (
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {isLoading ? 'Searching...' : 'Results'}
              </h2>
               {searchResults.length > 0 && !isLoading && (
                 <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-dark-800 px-2 py-1 rounded">
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