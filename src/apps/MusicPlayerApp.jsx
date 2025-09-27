/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './MusicPlayer.css'

// audio manager (global)
class AudioManager {
  constructor() {
    this.audioElements = [];
    this.currentAudioRef = null;
    this.isPlaying = false;
    this.currentSongIndex = 0;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1.0;
    this.listeners = new Set();
    this.isRepeating = false;
    this.initialized = false;
    this.playlist = []; 
  }

  // audio state changer
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(eventType, data) {
    this.listeners.forEach(callback => callback(eventType, data));
  }

  // audio setup
  async initialize(playlist, audioFiles) {
    if (this.initialized) return;
    
    this.initialized = true;
    this.playlist = [...playlist]; 
    const elements = [];
    
    for (let i = 0; i < playlist.length; i++) {
      const song = playlist[i];
      const audio = new Audio();
      const audioPath = audioFiles[song.audioId];
      
      if (audioPath) {
        audio.src = audioPath;
        audio.preload = 'metadata';
        audio.volume = this.volume;
        audio.loop = this.isRepeating;
        
        // handle  loading
        audio.addEventListener('loadedmetadata', () => {
          console.log(`Loaded: ${song.title}`);
        });
        
        // handle loading errors
        audio.addEventListener('error', (e) => {
          console.log(`Failed to load: ${song.title}`, e);
          elements[i] = null;
        });
        
        // handle song end
        audio.addEventListener('ended', () => {
          if (this.isRepeating) {
            audio.currentTime = 0;
            audio.play();
          } else {
            this.nextSong();
          }
        });
        
        // handle progress updates
        audio.addEventListener('timeupdate', () => {
          this.currentTime = audio.currentTime;
          this.duration = audio.duration || 0;
          this.notify('timeUpdate', {
            currentTime: this.currentTime,
            duration: this.duration
          });
        });
        
        elements.push(audio);
      } else {
        elements.push(null);
      }
    }
    
    this.audioElements = elements;
    // set current audio to first available song
    const firstAvailable = elements.find(el => el !== null);
    if (firstAvailable) {
      const firstIndex = elements.indexOf(firstAvailable);
      this.currentAudioRef = firstAvailable;
      this.currentSongIndex = firstIndex;
    }
  }

  updatePlaylist(newPlaylist) {
    this.playlist = [...newPlaylist];
    this.notify('playlistUpdated', { playlist: this.playlist });
  }
  // Add method to add new audio element
  addAudioElement(audio, songData) {
    this.audioElements.push(audio);
    this.playlist.push(songData);
    
    if (!this.currentAudioRef) {
      const newIndex = this.audioElements.length - 1;
      this.currentAudioRef = audio;
      this.currentSongIndex = newIndex;
      this.notify('songChanged', { 
        currentSongIndex: this.currentSongIndex 
      });
    }
    
    this.notify('playlistUpdated', { playlist: this.playlist });
  }

  getCurrentSong() {
    return this.playlist[this.currentSongIndex] || {};
  }

  // play current song
  async play() {
    if (!this.currentAudioRef) return false;
    
    try {
      this.currentAudioRef.volume = this.volume;
      await this.currentAudioRef.play();
      this.isPlaying = true;
      this.notify('playStateChanged', { isPlaying: true });
      return true;
    } catch (error) {
      console.log('Play failed:', error);
      this.isPlaying = false;
      this.notify('playStateChanged', { isPlaying: false });
      return false;
    }
  }

  // pause current song
  pause() {
    if (this.currentAudioRef) {
      this.currentAudioRef.pause();
      this.isPlaying = false;
      this.notify('playStateChanged', { isPlaying: false });
    }
  }

  // play/pause
  async togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  // selecting and playing a specific song
  selectSong(index) {
    if (!this.audioElements[index]) return false;
    
    // stop current audio
    if (this.currentAudioRef) {
      this.currentAudioRef.pause();
      this.currentAudioRef.currentTime = 0;
    }
    
    this.currentSongIndex = index;
    this.currentAudioRef = this.audioElements[index];
    
    if (this.currentAudioRef) {
      this.currentAudioRef.volume = this.volume;
    }
    
    this.notify('songChanged', { 
      currentSongIndex: this.currentSongIndex 
    });
    
    return true;
  }

  // switching 2 next song using arrow
  nextSong() {
    let nextIndex = this.currentSongIndex;
    do {
      nextIndex = (nextIndex + 1) % this.audioElements.length;
    } while (!this.audioElements[nextIndex] && nextIndex !== this.currentSongIndex);
    
    if (this.audioElements[nextIndex]) {
      const wasPlaying = this.isPlaying;
      this.selectSong(nextIndex);
      if (wasPlaying) {
        setTimeout(() => this.play(), 100);
      }
    }
  }

  //  now previous song
  previousSong() {
    let prevIndex = this.currentSongIndex;
    do {
      prevIndex = prevIndex > 0 ? prevIndex - 1 : this.audioElements.length - 1;
    } while (!this.audioElements[prevIndex] && prevIndex !== this.currentSongIndex);
    
    if (this.audioElements[prevIndex]) {
      const wasPlaying = this.isPlaying;
      this.selectSong(prevIndex);
      if (wasPlaying) {
        setTimeout(() => this.play(), 100);
      }
    }
  }

  // seting up volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioElements.forEach(audio => {
      if (audio) audio.volume = this.volume;
    });
    this.notify('volumeChanged', { volume: this.volume });
  }

  seekTo(percentage) {
    if (this.currentAudioRef && this.duration) {
      this.currentAudioRef.currentTime = percentage * this.duration;
    }
  }

  // repeat mode
  setRepeat(repeat) {
    this.isRepeating = repeat;
    this.audioElements.forEach(audio => {
      if (audio) audio.loop = repeat;
    });
    this.notify('repeatChanged', { isRepeating: repeat });
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      currentSongIndex: this.currentSongIndex,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isRepeating: this.isRepeating,
      hasCurrentSong: !!this.currentAudioRef,
      currentSong: this.getCurrentSong() // add current song to state
    };
  }

  // clean up when app is closed (stopping song)
  destroy() {
    this.pause();
    this.audioElements.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    });
    this.audioElements = [];
    this.currentAudioRef = null;
    this.listeners.clear();
    this.initialized = false;
    this.playlist = [];
  }
}

// create global instance
const globalAudioManager = new AudioManager();

const RetroAutumnMusicPlayer = ({ onAppClose, isClosing }) => {
  // playlist 
  const initialPlaylist = [
    {
      title: "Something Super Sweet",
      subtitle: "song if it was me wait what",
      audioId: "song-1",
      artist: "Rory Webley",
      coverImage: "./albums/2.jpg",
      coverColor: "linear-gradient(135deg, #FF6B6B, #FF8E53)"
    },
    {
      title: "No More What Ifs",
      subtitle: "such a beautiful song.. never gonna get tired of it..",
      audioId: "song-2",
      artist: "Persona 5 OST",
      coverImage: "./albums/1.jpg",
      coverColor: "linear-gradient(135deg, #4ECDC4, #44A08D)"
    },
    {
      title: "Dear Candy",
      subtitle: "i listen this song 2 cry at night 100% works",
      audioId: "song-3",
      artist: "The Cheers Cheers - Topic",
      coverImage: "./albums/3.jfif",
      coverColor: "linear-gradient(135deg, #845EC2, #B39BC8)"
    },
    {
      title: "告白秘密 ",
      subtitle: "makes me cry everytime..",
      audioId: "song-4",
      artist: "Persona 5 OST",
      coverImage: "./albums/1.jpg",
      coverColor: "linear-gradient(135deg, #FFC75F, #F9CA24)"
    },
    {
      title: "Silent Oath",
      subtitle: "this song's theme reminds me of my childhood days I DONT KNOW WHY",
      audioId: "song-5",
      artist: "Knights",
      coverImage: "./albums/4.jpg",
      coverColor: "linear-gradient(135deg, #6C5CE7, #A29BFE)"
    },
    {
      title: "Sustain Memories",
      subtitle: "oh this bring back.. memories..",
      audioId: "song-6",
      artist: "UNDEAD",
      coverImage: "./albums/5.jpg",
      coverColor: "linear-gradient(135deg, #FD79A8, #FDCB6E)"
    }
  ];

  // audio file paths 
  const audioFiles = {
    "song-1": "./soundzz/Something Super Sweet (Official Audio).mp3",
    "song-2": "./soundzz/No More What Ifs.mp3",
    "song-3": "./soundzz/Dear Candy.mp3",
    "song-4": "./soundzz/告白秘密 -piano version-.mp3",
    "song-5": "./soundzz/Silent Oath - Knights.mp3",
    "song-6": "./soundzz/Sustain Memories - UNDEAD.mp3"
  };

  // state vars
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [audioState, setAudioState] = useState(globalAudioManager.getState());
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [showHome, setShowHome] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // refs
  const fileInputRef = useRef(null);
  const clickSoundRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // click sound setup
  useEffect(() => {
    clickSoundRef.current = new Audio('/click.mp3');
    clickSoundRef.current.volume = 0.3;
  }, []);

  // initialize audio manager and subscribe to changes
  useEffect(() => {
    const initializeAudio = async () => {
      setShowLoading(true);
      await globalAudioManager.initialize(playlist, audioFiles);
      setAudioState(globalAudioManager.getState());
      setShowLoading(false);
    };

    initializeAudio();

    const unsubscribe = globalAudioManager.subscribe((eventType, data) => {
      switch (eventType) {
        case 'playStateChanged':
        case 'songChanged':
        case 'timeUpdate':
        case 'volumeChanged':
        case 'repeatChanged':
        case 'playlistUpdated':
          setAudioState(globalAudioManager.getState());
          break;
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // update mini player visibility based on play state
  useEffect(() => {
    if (audioState.isPlaying && showHome) {
      setShowMiniPlayer(true);
    } else if (showPlayer) {
      setShowMiniPlayer(false);
    }
  }, [audioState.isPlaying, showHome, showPlayer]);

  // app close - clean up audio
  useEffect(() => {
    // if isClosing prop is true, immediately destroy the audio manager
    if (isClosing) {
      globalAudioManager.destroy();
    }
    
    // cleanup function only runs on unmount - don't destroy here
    // as it could be just a minimize operation
    return () => {
      // component is unmounting - but don't destroy audio unless actually closing
      // the isClosing prop will handle only true closes
    };
  }, [isClosing]);

  // keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.target.tagName === 'INPUT') return;
    
    switch(event.code) {
      case 'Space':
        event.preventDefault();
        globalAudioManager.togglePlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        globalAudioManager.previousSong();
        break;
      case 'ArrowRight':
        event.preventDefault();
        globalAudioManager.nextSong();
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

// smooth dragging
useEffect(() => {
  const handleGlobalMouseMove = (event) => {
    if (isDraggingProgress) {
      const progressContainer = document.querySelector('.progress-container');
      if (progressContainer) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        if (audioState.hasCurrentSong && audioState.duration) {
          globalAudioManager.seekTo(percentage);
        }
      }
    }
    
    if (isDraggingVolume) {
      const volumeSlider = document.querySelector('.volume-slider');
      if (volumeSlider) {
        const rect = volumeSlider.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        globalAudioManager.setVolume(percentage);
      }
    }
  };

  const handleGlobalMouseUp = () => {
    setIsDraggingProgress(false);
    setIsDraggingVolume(false);
  };

  if (isDraggingProgress || isDraggingVolume) {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.body.style.userSelect = 'none';
  }

  return () => {
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.body.style.userSelect = '';
  };
}, [isDraggingProgress, isDraggingVolume, audioState.hasCurrentSong, audioState.duration]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(error => {
        console.log("Click sound play failed:", error);
      });
    }
  };

  // navigation
  const openPlaylist = () => {
    playClickSound();
    setShowPlaylist(true);
  };

  const closePlaylistPopup = () => {
    playClickSound();
    setShowPlaylist(false);
  };

  const goHome = () => {
    playClickSound();
    setShowPlayer(false);
    setShowHome(true);
    if (audioState.isPlaying) {
      setShowMiniPlayer(true);
    }
  };

  const showPlayerScreen = () => {
    playClickSound();
    setShowHome(false);
    setShowPlayer(true);
    setShowMiniPlayer(false);
  };

  // playlist functions
  const toggleShuffle = () => {
    playClickSound();
    const newShuffled = !isShuffled;
    setIsShuffled(newShuffled);
    
    if (newShuffled) {
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(i => globalAudioManager.audioElements[i] !== null);
      setShuffledPlaylist(availableIndices.sort(() => Math.random() - 0.5));
    }
  };

  const playAll = () => {
    playClickSound();
    const availableSongs = playlist.filter((song, index) => globalAudioManager.audioElements[index] !== null);
    if (availableSongs.length === 0) {
      alert('No audio files available to play. Please check your file paths.');
      return;
    }
    
    if (isShuffled && shuffledPlaylist.length === 0) {
      const availableIndices = playlist
        .map((_, index) => index)
        .filter(i => globalAudioManager.audioElements[i] !== null);
      setShuffledPlaylist(availableIndices.sort(() => Math.random() - 0.5));
    }
    
    const firstIndex = isShuffled ? shuffledPlaylist[0] : 
                     playlist.findIndex((song, index) => globalAudioManager.audioElements[index] !== null);
    
    selectSong(firstIndex);
    closePlaylistPopup();
    setTimeout(() => globalAudioManager.play(), 100);
  };

  const selectSong = (index) => {
    playClickSound();
    if (!globalAudioManager.selectSong(index)) {
      alert('Audio file not found. Please check the file path.');
      return;
    }
    
    showPlayerScreen();
    closePlaylistPopup();
  };

  // progress functions with smooth dragging
const handleProgressInteraction = (event, isDragging = false) => {
  if (!isDragging) playClickSound();
  if (audioState.hasCurrentSong && audioState.duration) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    globalAudioManager.seekTo(percentage);
  }
};

const handleProgressMouseDown = (event) => {
  setIsDraggingProgress(true);
  handleProgressInteraction(event);
};

// volume functions with smooth dragging
const handleVolumeInteraction = (event, isDragging = false) => {
  if (!isDragging) playClickSound();
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, clickX / rect.width));
  globalAudioManager.setVolume(percentage);
};

const handleVolumeMouseDown = (event) => {
  setIsDraggingVolume(true);
  handleVolumeInteraction(event);
};

  const toggleRepeat = () => {
    playClickSound();
    globalAudioManager.setRepeat(!audioState.isRepeating);
  };

  const toggleFavorite = () => {
    playClickSound();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(audioState.currentSongIndex)) {
      newFavorites.delete(audioState.currentSongIndex);
    } else {
      newFavorites.add(audioState.currentSongIndex);
    }
    setFavorites(newFavorites);
  };

  // file uploading functionality 
  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    playClickSound();
    event.currentTarget.classList.remove('dragover');
    const files = event.dataTransfer.files;
    addAudioFiles(files);
  };

  const handleFileSelect = (event) => {
    playClickSound();
    const files = event.target.files;
    addAudioFiles(files);
    event.target.value = '';
  };

  const addAudioFiles = (files) => {
  playClickSound();
  const newSongs = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('audio/')) continue;
    
    const objectUrl = URL.createObjectURL(file);
    const song = {
      title: file.name.replace(/\.[^/.]+$/, ""),
      subtitle: 'Uploaded song',
      audioId: `uploaded-${Date.now()}-${i}`,
      artist: 'Unknown',
      coverImage: null, // no cover image for uploaded songs
      coverColor: 'linear-gradient(135deg, #8B4513, #CD853F)',
      file: file,
      objectUrl: objectUrl
};
    newSongs.push(song);
    
    // create and configure audio element for the global audio manager (uploaded audio basically)
    const audio = new Audio();
    audio.src = objectUrl;
    audio.preload = 'metadata';
    audio.volume = globalAudioManager.volume;
    audio.loop = globalAudioManager.isRepeating;
    
    // setup event listeners like the original initialization
    audio.addEventListener('loadedmetadata', () => {
      console.log(`Loaded uploaded: ${song.title}`);
    });
    
    audio.addEventListener('error', (e) => {
      console.log(`Failed to load uploaded: ${song.title}`, e);
    });
    
    audio.addEventListener('ended', () => {
      if (globalAudioManager.isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        globalAudioManager.nextSong();
      }
    });
    
    audio.addEventListener('timeupdate', () => {
      globalAudioManager.currentTime = audio.currentTime;
      globalAudioManager.duration = audio.duration || 0;
      globalAudioManager.notify('timeUpdate', {
        currentTime: globalAudioManager.currentTime,
        duration: globalAudioManager.duration
      });
    });
   
    globalAudioManager.addAudioElement(audio, song);
  }
  
  if (newSongs.length > 0) {
    const newPlaylist = [...playlist, ...newSongs];
    setPlaylist(newPlaylist);
    globalAudioManager.updatePlaylist(newPlaylist);
    
    alert(`Added ${newSongs.length} song(s) to playlist!`);
  } else {
    alert('No valid audio files were selected.');
  }
};

  // get current song info - now use audioState.currentSong from audio manager
  const getCurrentSong = () => {
    return audioState.currentSong || playlist[audioState.currentSongIndex] || {};
  };

  return (
    <>
      <div className="music-player-container">
        <div className="app-container">
          {/* loading message */}
          {showLoading && (
            <div className="loading-message">Loading audio...</div>
          )}

          {/* mini player */}
          {showMiniPlayer && (
            <div className="mini-player" onClick={showPlayerScreen}>
              <div>♪ {getCurrentSong().title || 'No song playing'}</div>
            </div>
          )}

          {/* homescreen */}
          {showHome && (
            <div className="home-screen">
              <div className="app-title">MUSICPLAYER<br />Zoza's</div>
              
              <div className="character-placeholder">
            <img 
              src="./assets/kaoru2.gif" 
              alt="Kaoru Character"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
              onError={(e) => {
                // if GIF doesn't load
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = 'oh no.. image not loading.. <br/> cri';
              }}
            />
          </div>

              <button className="playlist-btn" onClick={openPlaylist}>PLAYLIST</button>
            </div>
          )}

          {/* playlist */}
          {showPlaylist && (
            <div className="playlist-popup">
              <div className="popup-header">
                MY PLAYLIST
                <div className="close-btn" onClick={closePlaylistPopup}>×</div>
              </div>
              
              <div className="playlist-controls">
                <button 
                  className={`control-btn ${isShuffled ? 'shuffle-active' : ''}`} 
                  onClick={toggleShuffle}
                >
                  SHUFFLE
                </button>
                <button className="control-btn" onClick={playAll}>PLAY ALL</button>
              </div>

              <div className="song-list">
                {playlist.map((song, index) => {
                  const isFavorite = favorites.has(index);
                  const isAvailable = globalAudioManager.audioElements[index] !== null;
                  const isCurrentlyPlaying = index === audioState.currentSongIndex;
                  
                  return (
                    <div 
                      key={index}
                      className={`song-item ${isCurrentlyPlaying ? 'playing' : ''}`}
                      onClick={() => isAvailable && selectSong(index)}
                      style={{
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.5
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div>{song.title}</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>
                            {song.subtitle} {!isAvailable ? '(File not found)' : ''}
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: isFavorite ? '#FF6347' : 'transparent' }}>♤</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div 
                className="upload-area" 
                onClick={() => {
                  playClickSound();
                  fileInputRef.current?.click();
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div>+ ADD MUSIC FILES</div>
                <div style={{ fontSize: '5px', marginTop: '5px' }}>Drop MP3 files here or click to browse</div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="audio/*" 
                  multiple 
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          )}

          {/* playerscreen*/}
          {showPlayer && (
            <div className="player-screen">
              <button className="back-btn" onClick={goHome}>←</button>
              
              <div className="cd-container">
                <div 
                className={`album-cover ${audioState.isPlaying ? 'playing' : ''} ${getCurrentSong().audioId?.startsWith('uploaded-') ? 'uploaded-cover' : ''}`}
                style={{ 
                  background: getCurrentSong().coverImage 
                  ? `url(${getCurrentSong().coverImage}) center/cover no-repeat, ${getCurrentSong().coverColor || 'linear-gradient(135deg, #8B4513, #CD853F)'}`: getCurrentSong().coverColor || 'linear-gradient(135deg, #8B4513, #CD853F)'
                }}
                >
                  {!getCurrentSong().coverImage && (getCurrentSong().title?.toUpperCase() || 'SELECT A SONG FROM PLAYLIST')}
                </div>
              </div>

              <div className="song-info">
                <div className="song-title">{getCurrentSong().title || 'Select a song'}</div>
                <div className="song-subtitle">{getCurrentSong().subtitle || 'Choose from playlist'}</div>
              </div>

              <div className="time-display">
                <span>{formatTime(audioState.currentTime)}</span>
                <span>{formatTime(audioState.duration)}</span>
              </div>

              <div 
              className="progress-container" 
              onMouseDown={handleProgressMouseDown}
              style={{ cursor: isDraggingProgress ? 'grabbing' : 'pointer' }}
              >
                
              <div 
              className="progress-bar" 
              style={{ width: audioState.duration ? `${(audioState.currentTime / audioState.duration) * 100}%` : '0%' }}
              ></div>
            </div>

              <div className="player-controls">
                <button className="nav-btn" onClick={() => globalAudioManager.previousSong()}>‹</button>
                <button className="play-pause-btn" onClick={() => globalAudioManager.togglePlayPause()}>
                  {audioState.isPlaying ? '⏸' : '▶'}
                </button>
                <button className="nav-btn" onClick={() => globalAudioManager.nextSong()}>›</button>
              </div>

              <div className="extra-controls">
                <button 
                  className={`extra-btn ${audioState.isRepeating ? 'active' : ''}`} 
                  onClick={toggleRepeat} 
                  title="Repeat"
                >
                  🔁
                </button>
                <button 
                  className={`extra-btn ${favorites.has(audioState.currentSongIndex) ? 'active' : ''}`} 
                  onClick={toggleFavorite} 
                  title="Favorite"
                >
                  ♤
                </button>
              </div>

              <div className="volume-controls">
                <span className="volume-label">VOL</span>
                <div 
                className="volume-slider" 
                onMouseDown={handleVolumeMouseDown}
                style={{ cursor: isDraggingVolume ? 'grabbing' : 'pointer' }}
                >
                <div 
                className="volume-fill" 
                style={{ width: `${audioState.volume * 100}%` }}
                >
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RetroAutumnMusicPlayer;