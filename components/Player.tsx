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
    <div className="player-bar">
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setIsPlaying(false)}
      />

      <div className="player-content">
        
        {/* Song Info */}
        <div className="current-song-info">
          <img 
            src={currentSong.thumbnail} 
            alt="Art" 
            className="current-thumb"
          />
          <div className="current-text">
            <div className="current-title">{currentSong.title}</div>
            <div className="current-artist">{currentSong.artists}</div>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="player-center">
          <div className="player-controls">
             <button onClick={onPrev} className="control-btn">
              <SkipBack size={20} />
            </button>
            
            <button onClick={togglePlay} className="play-btn">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <button onClick={onNext} className="control-btn">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <div className="progress-bar-wrapper">
               <div className="progress-bg">
                 <div 
                    className="progress-fill"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                 ></div>
               </div>
               <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="range-input"
              />
            </div>
            <span className="time-total">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="player-extras">
          <div className="volume-container">
            <button onClick={() => setIsMuted(!isMuted)} className="control-btn">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="volume-slider">
               <div 
                  className="volume-fill"
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
                className="range-input"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Player;