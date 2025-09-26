/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect, useRef } from 'react';

// sound files 
import homeMusic from './hehe/jazz.mp3';
import gameMusic from './hehe/jazzy-music.mp3';
import clickSound from './hehe/clickfr.mp3';
import eatSound from './hehe/eat.mp3'; 

const SnakeGame = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'instructions', 'highscores'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeGameHighScore') || '0');
  });
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);

  //game specific state
  const gridSize = 20;
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(generateFood());
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const directionRef = useRef('RIGHT');
  
  const speedRef = useRef(120);
  const directionBufferRef = useRef([]);
  
  const foodRef = useRef(generateFood());
  const scoreRef = useRef(0);

  const homeAudioRef = useRef(null);
  const gameAudioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const eatAudioRef = useRef(null);

  // game constants
  const GAME_WIDTH = 450;
  const GAME_HEIGHT = 450;

  // generate random food position
  function generateFood() {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  }

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
      background: 'linear-gradient(180deg, #2d5016 0%, #4a7c2a 100%)',
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
      background: 'linear-gradient(145deg, #8fbc8f, #6b8e23)',
      border: '4px solid',
      borderColor: '#8fbc8f #556b2f #556b2f #8fbc8f'
    },
    menuPanel: {
      textAlign: 'center',
      padding: '25px',
      backgroundColor: '#f0fff0',
      border: '3px solid',
      borderColor: '#556b2f #8fbc8f #8fbc8f #556b2f',
      borderRadius: '8px',
      boxShadow: '4px 4px 8px rgba(0,0,0,0.2)',
      maxWidth: '350px',
      width: '90%',
      fontFamily: 'Courier New, monospace'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#556b2f',
      marginBottom: '10px',
      margin: '0 0 10px 0',
      textShadow: '2px 2px 0px rgba(85,107,47,0.3)',
      fontFamily: 'Courier New, monospace'
    },
    subtitle: {
      fontSize: '12px',
      color: '#6b8e23',
      marginBottom: '20px',
      fontStyle: 'italic',
      fontFamily: 'Courier New, monospace',
      lineHeight: '1.3'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    button: {
      width: '100%',
      padding: '10px 20px',
      border: '3px solid',
      borderColor: '#8fbc8f #556b2f #556b2f #8fbc8f',
      borderRadius: '6px',
      fontWeight: 'bold',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'Courier New, monospace',
      textShadow: '1px 1px 0px rgba(85,107,47,0.3)'
    },
    playButton: {
      background: 'linear-gradient(145deg, #9acd32, #6b8e23)',
      color: '#f0fff0'
    },
    instructionsButton: {
      background: 'linear-gradient(145deg, #8fbc8f, #556b2f)',
      color: '#f0fff0'
    },
    highScoreButton: {
      background: 'linear-gradient(145deg, #556b2f, #364d1a)',
      color: '#f0fff0'
    },
    backButton: {
      background: 'linear-gradient(145deg, #8fbc8f, #556b2f)',
      color: '#f0fff0'
    },
    pauseButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '8px 16px',
      background: 'linear-gradient(145deg, #9acd32, #6b8e23)',
      color: '#f0fff0',
      border: '3px solid',
      borderColor: '#8fbc8f #556b2f #556b2f #8fbc8f',
      borderRadius: '6px',
      fontWeight: 'bold',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'Courier New, monospace',
      textShadow: '1px 1px 0px rgba(85,107,47,0.3)'
    },
    scoreDisplay: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#556b2f',
      background: 'linear-gradient(145deg, #8fbc8f, #6b8e23)',
      padding: '8px 16px',
      borderRadius: '6px',
      border: '2px solid',
      borderColor: '#556b2f #8fbc8f #8fbc8f #556b2f',
      fontFamily: 'Courier New, monospace',
      textShadow: '1px 1px 0px rgba(85,107,47,0.3)'
    },
    gameGrid: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '300px',
      height: '300px',
      border: '2px solid #556b2f',
      display: 'flex',
      flexWrap: 'wrap',
      background: '#90ee90'
    },
    gridCell: {
      boxSizing: 'border-box',
      border: '1px solid rgba(85,107,47,0.1)',
    },
    snakeSegment: {
      backgroundColor: '#556b2f',
      borderRadius: '2px',
    },
    food: {
      backgroundColor: '#ff4444',
      borderRadius: '50%',
    },
    gameOverOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(85, 107, 47, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    gameOverPanel: {
      background: 'linear-gradient(145deg, #f0fff0, #8fbc8f)',
      padding: '30px',
      border: '4px solid',
      borderColor: '#8fbc8f #556b2f #556b2f #8fbc8f',
      borderRadius: '8px',
      boxShadow: '4px 4px 12px rgba(0,0,0,0.3)',
      textAlign: 'center',
      maxWidth: '300px',
      fontFamily: 'Courier New, monospace'
    },
    gameOverTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#556b2f',
      marginBottom: '15px',
      margin: '0 0 15px 0',
      textShadow: '2px 2px 0px rgba(85,107,47,0.3)',
      fontFamily: 'Courier New, monospace'
    },
    instructionsContent: {
      color: '#556b2f',
      textAlign: 'left',
      marginBottom: '20px',
      fontSize: '12px',
      lineHeight: '1.4',
      fontFamily: 'Courier New, monospace',
      maxHeight: '200px',
      overflowY: 'auto'
    },
    instructionItem: {
      marginBottom: '10px',
      paddingLeft: '10px'
    },
    highScoreContent: {
      color: '#556b2f',
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
      color: '#556b2f'
    },
    italicText: {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#6b8e23',
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
      background: 'linear-gradient(145deg, #8fbc8f, #6b8e23)',
      border: '2px solid #556b2f',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '6px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      color: '#f0fff0',
      minWidth: '32px',
      height: '32px',
      fontFamily: 'Courier New, monospace'
    }
  };

  // setup audio
  useEffect(() => {
    homeAudioRef.current = new Audio(homeMusic);
    gameAudioRef.current = new Audio(gameMusic);
    clickAudioRef.current = new Audio(clickSound);
    eatAudioRef.current = new Audio(eatSound);
    
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

  // update volume
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume;
    
    if (homeAudioRef.current) homeAudioRef.current.volume = effectiveVolume;
    if (gameAudioRef.current) gameAudioRef.current.volume = effectiveVolume;
    if (clickAudioRef.current) clickAudioRef.current.volume = effectiveVolume;
    if (eatAudioRef.current) eatAudioRef.current.volume = effectiveVolume;
  }, [volume, isMuted]);

  // handle music based on game state
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

useEffect(() => {
  foodRef.current = food;
}, [food]);

useEffect(() => {
  scoreRef.current = score;
}, [score]);

  // play sound effects
  const playEatSound = () => {
    if (eatAudioRef.current) {
      eatAudioRef.current.currentTime = 0;
      eatAudioRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  const playClickSound = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  // reset game function
  const resetGame = useCallback(() => {
  const initialFood = generateFood();
  setSnake([{ x: 10, y: 10 }]);
  setFood(initialFood);
  foodRef.current = initialFood; // ADD THIS LINE
  setDirection('RIGHT');
  directionRef.current = 'RIGHT';
  directionBufferRef.current = []; 
  setGameOver(false);
  setScore(0);
  scoreRef.current = 0; // ADD THIS LINE
  speedRef.current = 120; 
  setIsPlaying(true);
}, []);

  const handleKeyPress = useCallback((e) => {
    if (!isPlaying || gameState !== 'playing') return;

    const key = e.key.toUpperCase();
    const currentDir = directionRef.current;
    let newDirection = null;

    switch (key) {
      case 'ARROWUP':
      case 'W':
        if (currentDir !== 'DOWN') newDirection = 'UP';
        break;
      case 'ARROWDOWN':
      case 'S':
        if (currentDir !== 'UP') newDirection = 'DOWN';
        break;
      case 'ARROWLEFT':
      case 'A':
        if (currentDir !== 'RIGHT') newDirection = 'LEFT';
        break;
      case 'ARROWRIGHT':
      case 'D':
        if (currentDir !== 'LEFT') newDirection = 'RIGHT';
        break;
      default:
        break;
    }

    // buffer the direction change to make controls more responsive
    if (newDirection && directionBufferRef.current.length < 2) {
      directionBufferRef.current.push(newDirection);
    }
  }, [isPlaying, gameState]);

  // smooth game loop with timing and score fix
  useEffect(() => {
  if (!isPlaying || gameState !== 'playing') return;

  const moveSnake = () => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      if (directionBufferRef.current.length > 0) {
        const nextDirection = directionBufferRef.current.shift();
        directionRef.current = nextDirection;
      }
      
      const newDirection = directionRef.current;

      // move head based on direction
      switch (newDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
        default:
          break;
      }

      // wall collision
      if (
        head.x < 0 || head.x >= gridSize ||
        head.y < 0 || head.y >= gridSize
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      //  food collision and handling score 
      const currentFood = foodRef.current;
      if (head.x === currentFood.x && head.y === currentFood.y) {
        // spawn food's position that doesn't overlap with snake
        let newFood;
        do {
          newFood = generateFood();
        } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        setFood(newFood);
        foodRef.current = newFood; 
        playEatSound();
        
        // update score only once per food consumption
        const newScore = scoreRef.current + 1;
        setScore(newScore);
        scoreRef.current = newScore; // ADD THIS LINE
        
        // increase speed slightly every 5 points for progressive difficulty
        if (newScore % 5 === 0) {
          speedRef.current = Math.max(60, speedRef.current - 8);
        }
        
        // dont remove tail when food is eaten (snake grows)
        return newSnake;
      } else {
        // remove tail when no food is eaten
        newSnake.pop();
        return newSnake;
      }
    });
  };

  const gameInterval = setInterval(moveSnake, speedRef.current);
  return () => clearInterval(gameInterval);
}, [isPlaying, gameState]); 

  // event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // save high score
  const saveHighScore = useCallback(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeGameHighScore', score.toString());
    }
  }, [score, highScore]);

  // game control functions
  const startGame = () => {
    playClickSound();
    setGameState('playing');
    resetGame();
  };

  const pauseGame = () => {
    playClickSound();
    setGameState('paused');
    setIsPlaying(false);
  };

  const resumeGame = () => {
    playClickSound();
    setGameState('playing');
    setIsPlaying(true);
  };

  const goToMenu = () => {
    playClickSound();
    saveHighScore();
    setGameState('menu');
    setIsPlaying(false);
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

  // button hover effects
  const handleButtonMouseEnter = (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 8px rgba(85,107,47,0.3)';
    e.target.style.borderColor = '#556b2f #8fbc8f #8fbc8f #556b2f';
  };

  const handleButtonMouseLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = '#8fbc8f #556b2f #556b2f #8fbc8f';
  };

  // render game grid
  const renderGrid = () => {
    const grid = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        let cellStyle = { ...styles.gridCell };
        if (isSnake) cellStyle = { ...cellStyle, ...styles.snakeSegment };
        if (isFood) cellStyle = { ...cellStyle, ...styles.food };

        grid.push(
          <div
            key={`${x}-${y}`}
            style={{
              ...cellStyle,
              width: `calc(100% / ${gridSize})`,
              height: `calc(100% / ${gridSize})`,
            }}
          />
        );
      }
    }

    return grid;
  };

  // volume control component
  const VolumeControl = () => (
    <div style={styles.volumeContainer}>
      <div style={styles.volumeButtonContainer}>
        <button 
          onClick={toggleMute} 
          style={styles.volumeButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #556b2f, #364d1a)';
            e.target.style.borderColor = '#556b2f #8fbc8f #8fbc8f #556b2f';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #8fbc8f, #6b8e23)';
            e.target.style.borderColor = '#556b2f';
          }}
        >
          {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔈'}
        </button>
        <button 
          onClick={toggleVolumeSlider} 
          style={styles.volumeButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #556b2f, #364d1a)';
            e.target.style.borderColor = '#556b2f #8fbc8f #8fbc8f #556b2f';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(145deg, #8fbc8f, #6b8e23)';
            e.target.style.borderColor = '#556b2f';
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
            background: `linear-gradient(to right, #556b2f 0%, #556b2f ${volume * 100}%, #8fbc8f ${volume * 100}%, #8fbc8f 100%)`,
            appearance: 'none',
            height: '6px',
            borderRadius: '3px',
            outline: 'none',
            border: '1px solid #364d1a'
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.gameArea}>
        {/* menu Screen */}
        {gameState === 'menu' && (
          <div style={styles.menuScreen}>
            <div style={styles.menuPanel}>
              <h1 style={styles.title}>APPLE GOBBLER</h1>
              <div style={styles.subtitle}>
                please get fat for once instead of getting longer
              </div>
              <div style={styles.buttonContainer}>
                <button
                  onClick={startGame}
                  style={{...styles.button, ...styles.playButton}}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
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
                <div style={styles.instructionItem}>• USE ARROW KEYS OR WASD TO CONTROL</div>
                <div style={styles.instructionItem}>• EAT THE RED FOOD TO GROW LONGER</div>
                <div style={styles.instructionItem}>• EACH FOOD GIVES YOU +1 POINT</div>
                <div style={styles.instructionItem}>• DON'T HIT THE WALLS OR YOURSELF</div>
                <div style={styles.instructionItem}>• PRESS PAUSE ANYTIME DURING GAME</div>
                <div style={styles.instructionItem}>• GAME GETS FASTER EVERY 5 POINTS!</div>
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

        {/* scores screen */}
        {gameState === 'highscores' && (
          <div style={styles.menuScreen}>
            <div style={styles.menuPanel}>
              <h2 style={styles.title}>🏆 HIGH SCORES</h2>
              <div style={styles.highScoreContent}>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLargeNumber}>BEST:</span> {highScore} POINTS
                </div>
                <div style={styles.scoreItem}>
                  <span style={styles.scoreLargeNumber}>CURRENT:</span> {score} POINTS
                </div>
                <p style={styles.italicText}>KEEP SLITHERING AND EATING!</p>
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

        {/* gamescreen*/}
        {gameState === 'playing' && (
          <>
            {/* score */}
            <div style={styles.scoreDisplay}>
              SCORE: {score}
            </div>

            {/* pause */}
            <button
              onClick={pauseGame}
              style={styles.pauseButton}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(145deg, #556b2f, #364d1a)';
                e.target.style.borderColor = '#556b2f #8fbc8f #8fbc8f #556b2f';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(145deg, #9acd32, #6b8e23)';
                e.target.style.borderColor = '#8fbc8f #556b2f #556b2f #8fbc8f';
              }}
            >
              ⏸️ PAUSE
            </button>

            {/* game grid*/}
            <div style={styles.gameGrid}>
              {renderGrid()}
            </div>

            {/* game over popup*/}
            {gameOver && (
              <div style={styles.gameOverOverlay}>
                <div style={styles.gameOverPanel}>
                  <h2 style={styles.gameOverTitle}>GAME OVER!</h2>
                  <p style={styles.instructionsContent}>
                    Your score: {score} points
                  </p>
                  <div style={styles.buttonContainer}>
                    <button
                      onClick={startGame}
                      style={{...styles.button, ...styles.playButton}}
                      onMouseEnter={handleButtonMouseEnter}
                      onMouseLeave={handleButtonMouseLeave}
                    >
                      🔄 PLAY AGAIN
                    </button>
                    <button
                      onClick={goToMenu}
                      style={{...styles.button, ...styles.backButton}}
                      onMouseEnter={handleButtonMouseEnter}
                      onMouseLeave={handleButtonMouseLeave}
                    >
                      🏠 BACK TO MENU
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* pause popup */}
        {gameState === 'paused' && (
          <div style={styles.gameOverOverlay}>
            <div style={styles.gameOverPanel}>
              <h2 style={styles.gameOverTitle}>GAME PAUSED</h2>
              <p style={styles.instructionsContent}>
                Your APPLE GOBBLER is taking a little break! 🐍
              </p>
              <div style={styles.buttonContainer}>
                <button
                  onClick={resumeGame}
                  style={{...styles.button, ...styles.playButton}}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  ▶️ CONTINUE
                </button>
                <button
                  onClick={goToMenu}
                  style={{...styles.button, ...styles.backButton}}
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

export default SnakeGame;