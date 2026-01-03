import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  streamUrl: string;
  onNext: () => void;
  onPrev: () => void;
}

const Player: React.FC<PlayerProps> = ({ currentSong, streamUrl, onNext, onPrev }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Reset state when song changes
  useEffect(() => {
    if (currentSong) {
      setIsPlaying(true);
      setCurrentTime(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentSong]);

  // Handle Play/Pause side effects
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]); 

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onNext();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-dark-700 px-4 py-3 shadow-2xl transition-colors duration-300">
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setIsPlaying(false)}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Song Info */}
        <div className="flex items-center w-full md:w-1/4 min-w-0 gap-3">
          <img 
            src={currentSong.thumbnail} 
            alt="Art" 
            className="w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-200 dark:bg-dark-800"
          />
          <div className="min-w-0 overflow-hidden">
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{currentSong.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentSong.artists}</div>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col items-center w-full md:w-2/4 gap-1">
          <div className="flex items-center gap-6">
             <button 
              onClick={onPrev}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
            </button>
            
            <button 
              onClick={onNext}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono mt-1">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 group">
               {/* Track Background */}
               <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gray-200 dark:bg-dark-700 rounded-full w-full"></div>
               {/* Progress Bar */}
               <div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-black dark:bg-white rounded-full pointer-events-none"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
               ></div>
               <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="hidden md:flex items-center justify-end w-1/4 gap-4">
          <div className="flex items-center gap-2 group">
            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="w-24 h-1 bg-gray-200 dark:bg-dark-700 rounded-full relative overflow-hidden">
               <div 
                  className="absolute top-0 left-0 h-full bg-gray-500 group-hover:bg-primary-500 transition-colors"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
               ></div>
               <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Player;