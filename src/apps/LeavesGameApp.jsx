
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from 'react';

// assets
import basketImg from './hehe/basket.png';
import leaf1Img from './hehe/leaf-1.png';
import leaf2Img from './hehe/leaf-2.png';
import leaf3Img from './hehe/leaf-3.png';

// audios
import homeMusic from './hehe/home-music.mp3';
import gameMusic from './hehe/game-music.mp3';
import clickSound from './hehe/clickfr.mp3';
import catchSound from './hehe/catch2.mp3';

const FallingLeavesGame = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'instructions', 'highscores'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('leafGameHighScore') || '0');
  });
  const [basketPosition, setBasketPosition] = useState(175);
  const [leaves, setLeaves] = useState([]);
  const [keysPressed, setKeysPressed] = useState({});
  const [volume, setVolume] = useState(0.5); // vol control (0 to 1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5); 

  // Add preloading state
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState({});
  
  const gameLoopRef = useRef();
  const leafIdCounter = useRef(0);
  const basketPositionRef = useRef(175);
  const basketVelocityRef = useRef(0); 
  const caughtLeafIds = useRef(new Set());
  const lastLeafSpawnTime = useRef(0);
  const activeLeafPositions = useRef([]);
  const keysPressedRef = useRef({});
  const lastFrameTime = useRef(0);
  const animationFrameId = useRef(null);
  
  // audio refs
  const homeAudioRef = useRef(null);
  const gameAudioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const catchAudioRef = useRef(null);

  // game constants
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 400;
  const BASKET_WIDTH = 50;
  const LEAF_SIZE = 20;
  const LEAF_FALL_SPEED = 1.5;
  const BASKET_ACCELERATION = 0.2; 
  const BASKET_MAX_SPEED = 5; 
  const BASKET_DECELERATION = 0.15; 
  const MIN_LEAF_HORIZONTAL_SPACING = 80;
  const MIN_LEAF_VERTICAL_SPACING = 150;
  const MIN_SPAWN_INTERVAL = 2000;

  // leaves
  const leafImages = [leaf1Img, leaf2Img, leaf3Img];

  const styles = {
    container: {
      position: 'relative',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      fontFamily: 'Courier New, monospace',
      overflow: 'hidden'
    },
    gameArea: {
      position: 'relative',
      background: 'linear-gradient(180deg, #bae6fd 0%, #bbf7d0 100%)', 
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    },
    menuScreen: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #f5deb3, #deb887)',
      border: '4px solid',
      borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3'
    },
    menuPanel: {
      textAlign: 'center',
      padding: '30px',
      backgroundColor: '#fef7cd',
      border: '3px solid',
      borderColor: '#8b4513 #f5deb3 #f5deb3 #8b4513',
      borderRadius: '8px',
      boxShadow: '4px 4px 8px rgba(0,0,0,0.2)',
      maxWidth: '320px',
      fontFamily: 'Courier New, monospace'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#8b4513',
      marginBottom: '30px',
      margin: '0 0 30px 0',
      textShadow: '2px 2px 0px rgba(139,69,19,0.3)',
      fontFamily: 'Courier New, monospace'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      border: '3px solid',
      borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
      borderRadius: '6px',
      fontWeight: 'bold',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'Courier New, monospace',
      textShadow: '1px 1px 0px rgba(139,69,19,0.3)'
    },
    playButton: {
      background: 'linear-gradient(145deg, #daa520, #b8860b)',
      color: '#fef7cd'
    },
    instructionsButton: {
      background: 'linear-gradient(145deg, #cd853f, #a0522d)',
      color: '#fef7cd'
    },
    highScoreButton: {
      background: 'linear-gradient(145deg, #8b4513, #654321)',
      color: '#fef7cd'
    },
    backButton: {
      background: 'linear-gradient(145deg, #cd853f, #a0522d)',
      color: '#fef7cd'
    },
    pauseButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '8px 16px',
      background: 'linear-gradient(145deg, #daa520, #b8860b)',
      color: '#fef7cd',
      border: '3px solid',
      borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
      borderRadius: '6px',
      fontWeight: 'bold',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'Courier New, monospace',
      textShadow: '1px 1px 0px rgba(139,69,19,0.3)'
    },
    scoreDisplay: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#8b4513',
      background: 'linear-gradient(145deg, #f5deb3, #deb887)',
      padding: '8px 16px',
      borderRadius: '6px',
      border: '2px solid',
      borderColor: '#8b4513 #f5deb3 #f5deb3 #8b4513',
      fontFamily: 'Courier New, monospace',
      textShadow: '1px 1px 0px rgba(139,69,19,0.3)'
    },
    leaf: {
      position: 'absolute',
      width: LEAF_SIZE,
      height: LEAF_SIZE,
      transition: 'transform 0.1s ease',
      userSelect: 'none'
    },
    basket: {
      position: 'absolute',
      bottom: '48px',
      width: BASKET_WIDTH,
      height: '40px',
      userSelect: 'none'
    },
    ground: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '32px',
      background: 'linear-gradient(180deg, #92400e 0%, #451a03 100%)'
    },
    pauseOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(139, 69, 19, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    pausePanel: {
      background: 'linear-gradient(145deg, #f5deb3, #deb887)',
      padding: '30px',
      border: '4px solid',
      borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
      borderRadius: '8px',
      boxShadow: '4px 4px 12px rgba(0,0,0,0.3)',
      textAlign: 'center',
      maxWidth: '300px',
      fontFamily: 'Courier New, monospace'
    },
    pauseTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#8b4513',
      marginBottom: '15px',
      margin: '0 0 15px 0',
      textShadow: '2px 2px 0px rgba(139,69,19,0.3)',
      fontFamily: 'Courier New, monospace'
    },
    pauseMessage: {
      color: '#654321',
      marginBottom: '20px',
      fontSize: '14px',
      fontFamily: 'Courier New, monospace'
    },
    continueButton: {
      background: 'linear-gradient(145deg, #22c55e, #16a34a)',
      color: 'white',
      marginBottom: '10px'
    },
    homeButton: {
      background: 'linear-gradient(145deg, #cd853f, #a0522d)',
      color: '#fef7cd'
    },
    instructionsContent: {
      color: '#654321',
      textAlign: 'left',
      marginBottom: '20px',
      fontSize: '12px',
      lineHeight: '1.4',
      fontFamily: 'Courier New, monospace',
      maxHeight: '150px',
    },
    instructionItem: {
      paddingLeft: '10px'
    },
    highScoreContent: {
      color: '#654321',
      marginBottom: '25px',
      fontFamily: 'Courier New, monospace'
    },
    scoreItem: {
      fontSize: '16px',
      marginBottom: '15px',
      fontFamily: 'Courier New, monospace'
    },
    scoreLargeNumber: {
      fontWeight: 'bold',
      color: '#8b4513'
    },
    italicText: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#a0522d',
      fontFamily: 'Courier New, monospace'
    },
    volumeContainer: {
      position: 'absolute',
      top: '5px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      zIndex: 10
    },
    volumeButtonContainer: {
      display: 'flex',
      gap: '8px'
    },
    volumeSliderContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.3s ease'
    },
    volumeSlider: {
      width: '80px',
      opacity: showVolumeSlider ? 1 : 0,
      visibility: showVolumeSlider ? 'visible' : 'hidden'
    },
    volumeButton: {
      background: 'linear-gradient(145deg, #f5deb3, #deb887)',
      border: '2px solid #8b4513',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '6px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      color: '#8b4513',
      minWidth: '32px',
      height: '32px',
      fontFamily: 'Courier New, monospace'
    }
  };

  // audio setup
  useEffect(() => {
    homeAudioRef.current = new Audio(homeMusic);
    gameAudioRef.current = new Audio(gameMusic);
    clickAudioRef.current = new Audio(clickSound);
    catchAudioRef.current = new Audio(catchSound);
    
    // looping audio
    homeAudioRef.current.loop = true;
    gameAudioRef.current.loop = true;
    
    return () => {
      if (homeAudioRef.current) {
        homeAudioRef.current.pause();
        homeAudioRef.current = null;
      }
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
        gameAudioRef.current = null;
      }
    };
  }, []);

  // updating audio
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume;
    
    if (homeAudioRef.current) homeAudioRef.current.volume = effectiveVolume;
    if (gameAudioRef.current) gameAudioRef.current.volume = effectiveVolume;
    if (clickAudioRef.current) clickAudioRef.current.volume = effectiveVolume;
    if (catchAudioRef.current) catchAudioRef.current.volume = effectiveVolume;
  }, [volume, isMuted]);

  // music handling (for diff game states)
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'instructions' || gameState === 'highscores') {
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
        gameAudioRef.current.currentTime = 0;
      }
      if (homeAudioRef.current && homeAudioRef.current.paused) {
        homeAudioRef.current.play().catch(e => console.log("Audio play error:", e));
      }
    } else if (gameState === 'playing') {
      if (homeAudioRef.current) {
        homeAudioRef.current.pause();
        homeAudioRef.current.currentTime = 0;
      }
      if (gameAudioRef.current && gameAudioRef.current.paused) {
        gameAudioRef.current.play().catch(e => console.log("Audio play error:", e));
      }
    } else if (gameState === 'paused') {
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
      }
    }
  }, [gameState]);

  // image preloading effect
  useEffect(() => {
    const preloadImages = async () => {
      const imagesToLoad = [
        { key: 'basket', src: basketImg },
        { key: 'leaf1', src: leaf1Img },
        { key: 'leaf2', src: leaf2Img },
        { key: 'leaf3', src: leaf3Img }
      ];

      const imagePromises = imagesToLoad.map(({ key, src }) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            console.log(`Loaded game image: ${key}`);
            resolve({ key, img, src });
          };
          img.onerror = () => {
            console.warn(`Failed to load game image: ${key}`);
            reject(new Error(`Failed to load ${key}`));
          };
          img.src = src;
        });
      });

      try {
        const loadedImagesArray = await Promise.all(imagePromises);
        const imageMap = {};
        loadedImagesArray.forEach(({ key, img, src }) => {
          imageMap[key] = { img, src };
        });
        
        setPreloadedImages(imageMap);
        setImagesLoaded(true);
        console.log('All game images preloaded successfully');
      } catch (error) {
        console.warn('Some game images failed to preload:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  // preloaded image source
  const getImageSrc = (key) => {
    return preloadedImages[key]?.src || leafImages[0]; // fallback
  };

  const getRandomLeafImage = () => {
    const leafKeys = ['leaf1', 'leaf2', 'leaf3'];
    const randomKey = leafKeys[Math.floor(Math.random() * leafKeys.length)];
    return getImageSrc(randomKey);
  };

  // sound effects
  const playCatchSound = () => {
    if (catchAudioRef.current) {
      catchAudioRef.current.currentTime = 0;
      catchAudioRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  const playClickSound = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  // leaf spawning logic
  const createLeaf = useCallback(() => {
    if (!imagesLoaded) return null;
    
    let newX;
    let canSpawn = false;
    let attempts = 0;
    const maxAttempts = 50;
    
    
    while (!canSpawn && attempts < maxAttempts) {
      newX = Math.random() * (GAME_WIDTH - LEAF_SIZE);
      canSpawn = true;
      
      
      for (const activeLeaf of activeLeafPositions.current) {
        const horizontalDistance = Math.abs(newX - activeLeaf.x);
        const verticalDistance = Math.abs(-LEAF_SIZE - activeLeaf.y);
        
        // they shall NOT be close to each other bro
        if (horizontalDistance < MIN_LEAF_HORIZONTAL_SPACING || 
            verticalDistance < MIN_LEAF_VERTICAL_SPACING) {
          canSpawn = false;
          break;
        }
      }
      
      attempts++;
    }
    
    // and dont spawn if no chance to not spawn farther away
    if (!canSpawn) {
      return null;
    }
    
    const newLeaf = {
      id: leafIdCounter.current++,
      x: newX,
      y: -LEAF_SIZE,
      image: getRandomLeafImage(), // use preloaded image
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
    };
    
    return newLeaf;
  }, [imagesLoaded]);

  // keybro controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      keysPressedRef.current[e.key] = true;
      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
      keysPressedRef.current[e.key] = false;
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // game animation
  useEffect(() => {
    if (gameState !== 'playing' || !imagesLoaded) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const gameLoop = (timestamp) => {
      if (!lastFrameTime.current) lastFrameTime.current = timestamp;
      const deltaTime = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;

     
      let targetVelocity = 0;
      
   
      if (keysPressedRef.current['ArrowLeft']) {
        targetVelocity = -BASKET_MAX_SPEED;
      } else if (keysPressedRef.current['ArrowRight']) {
        targetVelocity = BASKET_MAX_SPEED;
      }
      
     
      if (basketVelocityRef.current < targetVelocity) {
        basketVelocityRef.current = Math.min(basketVelocityRef.current + BASKET_ACCELERATION, targetVelocity);
      } else if (basketVelocityRef.current > targetVelocity) {
        basketVelocityRef.current = Math.max(basketVelocityRef.current - BASKET_ACCELERATION, targetVelocity);
      }
      
      
      if (targetVelocity === 0) {
        if (basketVelocityRef.current > 0) {
          basketVelocityRef.current = Math.max(0, basketVelocityRef.current - BASKET_DECELERATION);
        } else if (basketVelocityRef.current < 0) {
          basketVelocityRef.current = Math.min(0, basketVelocityRef.current + BASKET_DECELERATION);
        }
      }
      
    
      let newPos = basketPositionRef.current + basketVelocityRef.current * (deltaTime / 16);
      newPos = Math.max(0, Math.min(GAME_WIDTH - BASKET_WIDTH, newPos));
      
      
      basketPositionRef.current = newPos;
      setBasketPosition(newPos);

      const currentTime = Date.now();
      
      // only try to spawn a leaf if enough time has passed AND we don't have too many leaves
      const shouldTrySpawn = (currentTime - lastLeafSpawnTime.current) > MIN_SPAWN_INTERVAL && 
                            leaves.length < 3; // max 3 leaves on screen at once
      
      if (shouldTrySpawn && Math.random() < 0.3) { 
        const newLeaf = createLeaf();
        if (newLeaf) { // only add if createLeaf found a good position
          setLeaves(prev => {
            const updated = [...prev, newLeaf];
            activeLeafPositions.current = updated.map(leaf => ({
              x: leaf.x,
              y: leaf.y,
              id: leaf.id
            }));
            return updated;
          });
          lastLeafSpawnTime.current = currentTime;
        }
      }

      // update leaves
      setLeaves(prev => {
        const updatedLeaves = prev.map(leaf => ({
          ...leaf,
          y: leaf.y + LEAF_FALL_SPEED * (deltaTime / 16),
          rotation: leaf.rotation + leaf.rotationSpeed * (deltaTime / 16),
        })).filter(leaf => leaf.y < GAME_HEIGHT + LEAF_SIZE);

        // collision checking
        const remainingLeaves = [];
        let scoreIncrease = 0;

        updatedLeaves.forEach(leaf => {
          const leafCenterX = leaf.x + LEAF_SIZE / 2;
          const leafBottom = leaf.y + LEAF_SIZE;
          const basketTop = GAME_HEIGHT - 60;
          const basketLeft = basketPositionRef.current;
          const basketRight = basketPositionRef.current + BASKET_WIDTH;

          // checking if this leaf has already been caught
          if (caughtLeafIds.current.has(leaf.id)) {
            // skip  for already caught leaves
            return;
          }

          if (leafBottom >= basketTop && 
              leafCenterX >= basketLeft && 
              leafCenterX <= basketRight &&
              leaf.y <= GAME_HEIGHT - 40) {
            caughtLeafIds.current.add(leaf.id);
            scoreIncrease += 1;
            playCatchSound();
          } else {
            // only adding uncaught leaves back to the array
            remainingLeaves.push(leaf);
          }
        });

        if (scoreIncrease > 0) {
          setScore(prev => prev + scoreIncrease);
        }

        activeLeafPositions.current = remainingLeaves.map(leaf => ({
          x: leaf.x,
          y: leaf.y,
          id: leaf.id
        }));

        return remainingLeaves;
      });

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, createLeaf, leaves.length, imagesLoaded]);

  // saving high score
  const saveHighScore = useCallback(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('leafGameHighScore', score.toString());
    }
  }, [score, highScore]);

  const startGame = () => {
    if (!imagesLoaded) return; // don NOT start if images arent loaded
    
    playClickSound();

    setGameState('playing');
    setScore(0);
    setLeaves([]);
    setBasketPosition(175);
    basketPositionRef.current = 175;
    basketVelocityRef.current = 0; 
    leafIdCounter.current = 0;
    caughtLeafIds.current.clear();
    lastLeafSpawnTime.current = 0;
    activeLeafPositions.current = [];
    lastFrameTime.current = 0;
  };

  const pauseGame = () => {
    playClickSound();
    setGameState('paused');
  };

  const resumeGame = () => {
    playClickSound();
    setGameState('playing');
  };

  const goToMenu = () => {
    playClickSound();
    saveHighScore();
    setGameState('menu');
    setLeaves([]);
  };

  const showInstructions = () => {
    playClickSound();
    setGameState('instructions');
  };

  const showHighScores = () => {
    playClickSound();
    setGameState('highscores');
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
    playClickSound();
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
    playClickSound();
  };

  // button hovers
  const handleButtonMouseEnter = (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 8px rgba(139,69,19,0.3)';
    e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513';
  };

  const handleButtonMouseLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3';
  };
  // vlume controls
  const VolumeControl = () => (
    <div style={styles.volumeContainer}>
      <div style={styles.volumeButtonContainer}>
        <button 
          onClick={toggleMute} 
          style={styles.volumeButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #8b4513, #654321)';
            e.target.style.color = '#f5deb3';
            e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #f5deb3, #deb887)';
            e.target.style.color = '#8b4513';
            e.target.style.borderColor = '#8b4513';
          }}
        >
          {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔈'}
        </button>
        <button 
          onClick={toggleVolumeSlider} 
          style={styles.volumeButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #8b4513, #654321)';
            e.target.style.color = '#f5deb3';
            e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #f5deb3, #deb887)';
            e.target.style.color = '#8b4513';
            e.target.style.borderColor = '#8b4513';
          }}
        >
          🎛️
        </button>
      </div>
      <div style={styles.volumeSliderContainer}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            ...styles.volumeSlider,
            background: `linear-gradient(to right, #8b4513 0%, #8b4513 ${volume * 100}%, #deb887 ${volume * 100}%, #deb887 100%)`,
            appearance: 'none',
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            border: '1px solid #654321'
          }}
        />
      </div>
    </div>
  );
  // loading screen if images not loaded 
  if (!imagesLoaded) {
    return (
      <div style={styles.container}>
        <div style={styles.gameArea}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #f5deb3, #deb887)',
            color: '#8b4513',
            fontSize: '14px',
            fontFamily: 'Courier New, monospace'
          }}>
            Loading game assets... 🍂
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      <div style={styles.gameArea}>
        {/* menu screen */}
        {gameState === 'menu' && (
          <div style={styles.menuScreen}>
            <div style={styles.menuPanel}>
              <h1 style={styles.title}>🍂 FALLING LEAVES 🍂</h1>
              <div style={styles.buttonContainer}>
                <button
                onClick={startGame}
                style={{...styles.button, ...styles.playButton}}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
                disabled={!imagesLoaded}
                >
                  🎮 PLAY GAME
                </button>
                <button
                  onClick={showInstructions}
                  style={{...styles.button, ...styles.instructionsButton}}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  📖 INSTRUCTIONS
                </button>
                <button
                  onClick={showHighScores}
                  style={{...styles.button, ...styles.highScoreButton}}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  🏆 HIGH SCORES
                </button>
              </div>
            </div>
            <VolumeControl />
          </div>
        )}

        {/* instructions screen */}
        {gameState === 'instructions' && (
          <div style={styles.menuScreen}>
            <div style={styles.menuPanel}>
              <h2 style={styles.title}>📖 HOW TO PLAY</h2>
              <div style={styles.instructionsContent}>
                <div style={styles.instructionItem}>• USE ← → ARROW KEYS TO MOVE YOUR BASKET</div>
                <div style={styles.instructionItem}>• CATCH FALLING LEAVES TO SCORE POINTS</div>
                <div style={styles.instructionItem}>• EACH LEAF GIVES YOU +1 POINT</div>
                <div style={styles.instructionItem}>• PRESS PAUSE ANYTIME DURING THE GAME</div>
                <div style={styles.instructionItem}>• ENJOY THE PEACEFUL LEAF COLLECTING!</div>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setGameState('menu');
                }}
                style={{...styles.button, ...styles.backButton}}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                🏠 BACK TO MENU
              </button>
            </div>
            <VolumeControl />
          </div>
        )}

        {/* high scores screen */}
        {gameState === 'highscores' && (
          <div style={styles.menuScreen}>
            <div style={styles.menuPanel}>
              <h2 style={styles.title}>🏆 HIGH SCORES</h2>
              <div style={styles.highScoreContent}>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLargeNumber}>BEST SCORE:</span> {highScore} LEAVES
                </div>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLargeNumber}>CURRENT SCORE:</span> {score} LEAVES
                </div>
                <p style={styles.italicText}>KEEP COLLECTING THOSE COZY AUTUMN LEAVES!</p>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setGameState('menu');
                }}
                style={{...styles.button, ...styles.backButton}}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                🏠 BACK TO MENU
              </button>
            </div>
            <VolumeControl />
          </div>
        )}

        {/* same screen */}
        {gameState === 'playing' && (
          <>
            {/* score */}
            <div style={styles.scoreDisplay}>
              SCORE: {score}
            </div>

            {/* pause button */}
            <button
              onClick={pauseGame}
              style={styles.pauseButton}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(145deg, #8b4513, #654321)';
                e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(145deg, #daa520, #b8860b)';
                e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3';
              }}
            >
              ⏸️ PAUSE
            </button>

            {/* leaves falling */}
            {leaves.map(leaf => (
              <img
                key={leaf.id}
                src={leaf.image}
                alt="leaf"
                style={{
                  ...styles.leaf,
                  left: leaf.x,
                  top: leaf.y,
                  transform: `rotate(${leaf.rotation}deg)`
                }}
              />
            ))}

            {/* basket */}
            <img
              src={basketImg}
              alt="basket"
              style={{
                ...styles.basket,
                left: basketPosition
              }}
            />

            {/* ground */}
            <div style={styles.ground}></div>
          </>
        )}

        {/* pause popup */}
        {gameState === 'paused' && (
          <div style={styles.pauseOverlay}>
            <div style={styles.pausePanel}>
              <h2 style={styles.pauseTitle}>GAME PAUSED</h2>
              <p style={styles.pauseMessage}>
                LET'S COLLECT LEAVES AS MUCH AS WE CAN FOR A COZY TEA 🍵
              </p>
              <div style={styles.buttonContainer}>
                <button
                  onClick={resumeGame}
                  style={{...styles.button, ...styles.continueButton}}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  ▶️ CONTINUE
                </button>
                <button
                  onClick={goToMenu}
                  style={{...styles.button, ...styles.homeButton}}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  🏠 BACK TO MENU
                </button>
              </div>
              <VolumeControl />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FallingLeavesGame;