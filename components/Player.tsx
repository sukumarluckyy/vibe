import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, ChevronDown, Heart, Repeat
} from 'lucide-react';
import Hls from 'hls.js';
import { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  streamUrl: string;
  onNext: () => void;
  onPrev: () => void;
  isFullScreen: boolean;
  onCloseFullScreen: () => void;
  onOpenFullScreen: () => void;
  onToggleLike: (song: Song) => void;
  isLiked: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  currentSong, 
  streamUrl, 
  onNext, 
  onPrev,
  isFullScreen,
  onCloseFullScreen,
  onOpenFullScreen,
  onToggleLike,
  isLiked
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<boolean>(false);

  // Reset state when song changes
  useEffect(() => {
    if (currentSong) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentSong]);

  // Handle Stream Loading (HLS or Native)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    // Cleanup previous HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = streamUrl.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(audio);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audio.play().catch(e => console.error("HLS play failed", e));
        }
      });
    } else {
      // Native HLS (Safari) or standard MP3
      audio.src = streamUrl;
      if (isPlaying) {
         // Tiny delay to ensure source is ready in some browsers
         setTimeout(() => {
            audio.play().catch(e => console.error("Native play failed", e));
         }, 50);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl]);

  // Handle Play/Pause side effects
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play policy might block this if not triggered by user
          // We suppress the error here as the UI state will sync on events
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]); 

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(!isPlaying);
  };

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
    if (loopMode && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onNext();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  // Render Full Screen Player
  if (isFullScreen) {
    return (
      <div className="full-player-overlay">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={(e) => console.error("Audio error", e)}
        />
        
        <div className="full-player-header">
           <div style={{ width: '40px' }}></div> 
           
           <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>
             NOW PLAYING
           </span>
           
           <button onClick={onCloseFullScreen} className="hide-player-btn">
             <ChevronDown size={32} />
           </button>
        </div>

        <div className="full-player-content">
          <div className="full-art-container">
            <img src={currentSong.thumbnail} alt={currentSong.title} className="full-art" />
          </div>

          <div className="full-track-info">
             <h2 className="full-title">{currentSong.title}</h2>
             <p className="full-artist">{currentSong.artists}</p>
          </div>

          <div className="full-controls-container">
             {/* Progress */}
             <div className="progress-container">
                <div className="progress-bar-wrapper">
                    <div className="progress-bg"></div>
                    <div 
                        className="progress-fill" 
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="progress-slider"
                    />
                </div>
                
                <div className="full-time-row">
                   <span>{formatTime(currentTime)}</span>
                   <span>{formatTime(duration)}</span>
                </div>
             </div>

             {/* Main Controls */}
             <div className="main-controls">
                <button 
                  className={`action-btn ${isLiked ? 'active' : ''}`}
                  onClick={() => onToggleLike(currentSong)}
                >
                  <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
                </button>
                
                <button onClick={onPrev} className="action-btn">
                  <SkipBack size={32} />
                </button>
                
                <button onClick={() => togglePlay()} className="play-pause-lg">
                   {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
                
                <button onClick={onNext} className="action-btn">
                  <SkipForward size={32} />
                </button>
                
                <button 
                  className={`action-btn ${loopMode ? 'active' : ''}`}
                  onClick={() => setLoopMode(!loopMode)}
                >
                   <Repeat size={28} />
                   {loopMode && <span style={{position:'absolute', fontSize:'10px', bottom: '8px', fontWeight:'bold'}}>1</span>}
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Mini Floating Player
  return (
    <div className="mini-player-container">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => console.error("Audio error", e)}
      />

      <div className="mini-player" onClick={onOpenFullScreen}>
        <div className="mini-info">
          <img src={currentSong.thumbnail} alt="art" className="mini-thumb" />
          <div className="mini-text">
            <div className="mini-title">{currentSong.title}</div>
            <div className="mini-artist">{currentSong.artists}</div>
          </div>
        </div>

        <div className="mini-controls">
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleLike(currentSong); }} 
             className={`mini-action-btn ${isLiked ? 'liked' : ''}`}
             aria-label="Like"
           >
             <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
           </button>
           
           <button 
             onClick={(e) => { e.stopPropagation(); togglePlay(e); }} 
             className="mini-play-btn"
             aria-label={isPlaying ? "Pause" : "Play"}
           >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Player;