import React, { useState, useEffect, useRef } from 'react';

const AutumnTicTacToe = () => {
  const [board, setBoard] = useState(['', '', '', '', '', '', '', '', '']);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameActive, setGameActive] = useState(true);
  const [playerWins, setPlayerWins] = useState(0);
  const [kaoruWins, setKaoruWins] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showGamePopup, setShowGamePopup] = useState(false);
  const [showStatsPopup, setShowStatsPopup] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  const audioRef = useRef(null);

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  // function to play the click sound
  const playClickSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log("Audio play failed:", error);
      });
    }
  };

  useEffect(() => {
    audioRef.current = new Audio('/click.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  const startGame = () => {
    playClickSound();
    setCurrentScreen('game');
    resetGame();
  };

  const goHome = () => {
    playClickSound();
    setCurrentScreen('home');
    setShowGamePopup(false);
    setShowStatsPopup(false);
  };

  const resetGame = () => {
    setBoard(['', '', '', '', '', '', '', '', '']);
    setCurrentPlayer('X');
    setGameActive(true);
  };

  const makeMove = (index) => {
    if (board[index] !== '' || !gameActive || currentPlayer !== 'X') {
      return;
    }

    playClickSound();
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    if (checkWinner(newBoard)) {
      endGame('Player');
      return;
    }

    if (newBoard.every(cell => cell !== '')) {
      endGame('Draw');
      return;
    }

    setCurrentPlayer('O');
    setTimeout(() => kaoruMove(newBoard), 800);
  };

  const kaoruMove = (currentBoard) => {
    if (!gameActive) return;

    const availableMoves = currentBoard.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    
    if (availableMoves.length === 0) return;

    const move = getBestMove(currentBoard);
    
    const newBoard = [...currentBoard];
    newBoard[move] = 'O';
    setBoard(newBoard);

    if (checkWinner(newBoard)) {
      endGame('Kaoru');
      return;
    }

    if (newBoard.every(cell => cell !== '')) {
      endGame('Draw');
      return;
    }

    setCurrentPlayer('X');
  };

  const getBestMove = (currentBoard) => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === '') {
        const testBoard = [...currentBoard];
        testBoard[i] = 'O';
        if (checkWinner(testBoard)) {
          return i;
        }
      }
    }

    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === '') {
        const testBoard = [...currentBoard];
        testBoard[i] = 'X';
        if (checkWinner(testBoard)) {
          return i;
        }
      }
    }

    if (currentBoard[4] === '') {
      return 4;
    }

    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => currentBoard[i] === '');
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    const availableMoves = currentBoard.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const checkWinner = (currentBoard) => {
    return winningConditions.some(condition => {
      const [a, b, c] = condition;
      return currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c];
    });
  };

  const endGame = (winner) => {
    setGameActive(false);

    let message = '';
    if (winner === 'Player') {
      message = 'Gahh, you\'re good at this! 😤';
      setPlayerWins(prev => prev + 1);
    } else if (winner === 'Kaoru') {
      message = 'Hehe~ I won!';
      setKaoruWins(prev => prev + 1);
    } else {
      message = 'A draw? Not bad, not bad... 🤔';
    }

    setChatMessage(message);
    setShowGamePopup(true);
    playClickSound();
  };

  const playAgain = () => {
    playClickSound();
    setShowGamePopup(false);
    resetGame();
  };

  const showWinners = () => {
    playClickSound();
    setShowStatsPopup(true);
  };

  const closeStats = () => {
    playClickSound();
    setShowStatsPopup(false);
  };

  const getGameInfo = () => {
    if (!gameActive) return '';
    if (currentPlayer === 'X') {
      return 'Your turn! You are X';
    } else {
      return 'Kaoru is thinking...';
    }
  };

  const getOverallMessage = () => {
    if (playerWins === 0 && kaoruWins === 0) {
      return 'No matches played yet!';
    } else if (playerWins > kaoruWins) {
      return '🎉 You won more matches!';
    } else if (kaoruWins > playerWins) {
      return 'Kaoru won more matches!';
    } else {
      return '🤝 It\'s tied overall!';
    }
  };

  const styles = {
    container: {
    fontFamily: "'Nunito', sans-serif",
    background: 'transparent',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#8b4513',
    position: 'relative',
    overflow: 'hidden'
  },
  appContainer: {
    background: 'transparent',
    borderRadius: '20px',
    padding: '12px', 
    boxSizing: 'border-box',
    boxShadow: '0 15px 35px rgba(139, 69, 19, 0.15)',
    border: '3px solid #d4a574',
    width: '100%',
    height: '100%',
    maxWidth: '360px',
    maxHeight: '420px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
    title: {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '2em', 
      color: '#a0522d',
      marginBottom: '5px', 
      textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
      flexShrink: 0
    },
    button: {
      background: 'linear-gradient(145deg, #deb887, #cd853f)',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '25px',
      fontFamily: "'Nunito', sans-serif",
      fontWeight: '600',
      fontSize: '0.9em',
      color: '#8b4513',
      cursor: 'pointer',
      margin: '6px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(205, 133, 63, 0.3)'
    },
    homeScreen: {
      display: currentScreen === 'home' ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      gap: '20px'
    },
    gameScreen: {
      display: currentScreen === 'game' ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'flex-start', 
      height: '100%',
      padding: '5px 0' 
    },
    homeButtonContainer: {
      marginTop: 'auto', 
      paddingTop: '10px'
    },
    gameBoard: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '6px',
      margin: '10px auto', 
      background: '#d4a574',
      padding: '10px',
      borderRadius: '15px',
      boxShadow: 'inset 0 4px 8px rgba(139, 69, 19, 0.2)',
      width: '210px', 
      height: '210px',
      aspectRatio: '1 / 1',
      boxSizing: 'content-box'
    },
    cell: {
      width: '60px',
      height: '60px',
      background: '#faf7f0',
      border: 'none',
      borderRadius: '10px',
      fontFamily: "'Fredoka One', cursive",
      fontSize: '1.5em',
      color: '#8b4513',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 3px 10px rgba(139, 69, 19, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '60px',
      minHeight: '60px',
      flexShrink: 0
    },
    gameInfo: {
      margin: '8px 0', 
      fontWeight: '700',
      fontSize: '0.9em', 
      flexShrink: 0
    },
    popupOverlay: {
      display: showGamePopup || showStatsPopup ? 'flex' : 'none',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(139, 69, 19, 0.4)',
      zIndex: 10000,
      backdropFilter: 'blur(3px)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    popup: {
      background: '#faf7f0',
      padding: '25px',
      borderRadius: '20px',
      textAlign: 'center',
      boxShadow: '0 20px 40px rgba(135, 56, 0, 0.3)',
      border: '3px solid #d4a574',
      minWidth: '260px',
      maxWidth: '90%'
    },
    popupTitle: {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '1.5em',
      color: '#a0522d',
      marginBottom: '15px'
    },
    popupText: {
      marginBottom: '15px',
      fontWeight: '600',
      color: '#8b4513',
      fontSize: '1em'
    },
    chatPopup: {
      background: 'linear-gradient(135deg, #614812ff 0%, #c1aa71ff 100%)',
      border: '3px solid #444',
      color: 'white',
      padding: '0',
      borderRadius: '15px',
      minWidth: '250px',
      maxWidth: '280px',
      overflow: 'hidden'
    },
    chatHeader: {
      background: 'linear-gradient(135deg, #d4a574 0%, #cd853f 100%)',
      padding: '10px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderBottom: '2px solid #444'
    },
    chatPfp: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8b4513, #a0522d)',
      border: '2px solid #faf7f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2em',
      color: '#faf7f0',
      flexShrink: 0
    },
    chatName: {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '1em',
      color: '#2a2a2a',
      textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)'
    },
    chatBody: {
      padding: '15px',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
      position: 'relative'
    },
    chatDialogue: {
      background: 'rgba(212, 165, 116, 0.15)',
      border: '2px solid #d4a574',
      borderRadius: '10px',
      padding: '12px',
      marginBottom: '15px',
      position: 'relative'
    },
    chatText: {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '0.95em',
      color: '#f0e68c',
      margin: '0',
      textAlign: 'left',
      lineHeight: '1.4'
    },
    chatButtons: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    chatBtn: {
      background: 'linear-gradient(145deg, #d4a574, #cd853f)',
      border: '2px solid #8b4513',
      padding: '8px 15px',
      borderRadius: '20px',
      fontFamily: "'Nunito', sans-serif",
      fontWeight: '600',
      fontSize: '0.8em',
      color: '#2a2a2a',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    stats: {
      background: '#f5f2e8',
      padding: '12px',
      borderRadius: '10px',
      margin: '12px 0',
      border: '2px solid #e8dcc6'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '6px 0',
      fontWeight: '600',
      fontSize: '0.9em'
    },
    winnerText: {
      fontStyle: 'italic',
      color: '#a0522d',
      fontWeight: '700',
      marginTop: '8px',
      fontSize: '0.9em'
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/click.mp3" preload="auto" />
      
      <div style={styles.container}>
        <div style={styles.appContainer}>
          {/* homescreen*/}
          <div style={styles.homeScreen}>
            <h1 style={styles.title}> ★ TickleTackleToe ☆</h1>
            <button style={styles.button} onClick={startGame}>Start Game</button>
            <button style={styles.button} onClick={showWinners}>Show Winners</button>
          </div>

          {/* gamescreen*/}
          <div style={styles.gameScreen}>
            <h1 style={styles.title}>🍂 Playing...</h1>
            <div style={styles.gameInfo}>{getGameInfo()}</div>
            <div style={styles.gameBoard}>
              {board.map((cell, index) => (
                <button 
                key={index}
                className="cell" 
                style={styles.cell}
                onClick={() => makeMove(index)}
                disabled={cell !== '' || !gameActive || currentPlayer !== 'X'}
                >
                  {cell}
                </button>
              ))}
            </div>
            <button 
              style={styles.button} 
              onClick={goHome}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(205, 133, 63, 0.4)';
                e.target.style.background = 'linear-gradient(145deg, #f0e68c, #daa520)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(205, 133, 63, 0.3)';
                e.target.style.background = 'linear-gradient(145deg, #deb887, #cd853f)';
              }}
            >
              🏠 Home
            </button>
          </div>
        </div>

        {/* popup*/}
        <div style={styles.popupOverlay}>
          {/* game result */}
          {showGamePopup && (
            <div style={styles.chatPopup}>
              <div style={styles.chatHeader}>
                <div style={styles.chatPfp}>
                  <img 
                    src="./assets/silly.jpg" 
                    alt="Kaoru"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div style={styles.chatName}>Kaoru</div>
              </div>
              <div style={styles.chatBody}>
                <div style={styles.chatDialogue}>
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '18px',
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid #d4a574'
                  }}></div>
                  <p style={styles.chatText}>{chatMessage}</p>
                </div>
                <div style={styles.chatButtons}>
                  <button 
                    style={styles.chatBtn} 
                    onClick={playAgain}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(145deg, #f0e68c, #daa520)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(145deg, #d4a574, #cd853f)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Play Again
                  </button>
                  <button 
                    style={styles.chatBtn} 
                    onClick={goHome}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(145deg, #f0e68c, #daa520)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(145deg, #d4a574, #cd853f)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    🏠 Home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* winners */}
          {showStatsPopup && (
            <div style={styles.popup}>
              <h2 style={styles.popupTitle}>🏆 Match Statistics</h2>
              <div style={styles.stats}>
                <div style={styles.statRow}>
                  <span>Player (You):</span>
                  <span>{playerWins} {playerWins === 1 ? 'win' : 'wins'}</span>
                </div>
                <div style={styles.statRow}>
                  <span>Kaoru:</span>
                  <span>{kaoruWins} {kaoruWins === 1 ? 'win' : 'wins'}</span>
                </div>
                <div style={styles.winnerText}>{getOverallMessage()}</div>
              </div>
              <button 
                style={styles.button} 
                onClick={closeStats}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(205, 133, 63, 0.4)';
                  e.target.style.background = 'linear-gradient(145deg, #f0e68c, #daa520)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(205, 133, 63, 0.3)';
                  e.target.style.background = 'linear-gradient(145deg, #deb887, #cd853f)';
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AutumnTicTacToe;