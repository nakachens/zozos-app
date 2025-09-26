/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';

const MemoryGame = () => {
  const autumnSymbols = ['🍂', '🍄', '🎃', '🌰', '🍁', '🦉', '🕷️', '🌙'];
  
  // audio refs
  const backgroundMusicRef = useRef(null);
  const clickSoundRef = useRef(null);
  const cardFlipSoundRef = useRef(null);
  
  // audio states
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const [leafPositions] = useState(() => 
    [...Array(8)].map((_, i) => ({ 
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 4,
    }))
  );

  const createDeck = () => {
    const pairs = [...autumnSymbols, ...autumnSymbols];
    return pairs
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(createDeck());
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [records, setRecords] = useState([]);

  // audio setup
  useEffect(() => {
    backgroundMusicRef.current = new Audio('memorygame-music.mp3');
    clickSoundRef.current = new Audio('click.mp3');
    cardFlipSoundRef.current = new Audio('cardflip.mp3');
    
    // bg music setup
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = volume;
    
    // sound effects setup
    clickSoundRef.current.volume = volume;
    cardFlipSoundRef.current.volume = volume;
    
    // bg music start
    if (!isMuted) {
      backgroundMusicRef.current.play().catch(e => console.log('Audio autoplay prevented'));
    }
    
    return () => {
      // cleanup aud
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      if (clickSoundRef.current) {
        clickSoundRef.current.pause();
        clickSoundRef.current = null;
      }
      if (cardFlipSoundRef.current) {
        cardFlipSoundRef.current.pause();
        cardFlipSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = isMuted ? 0 : volume;
    }
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = isMuted ? 0 : volume;
    }
    if (cardFlipSoundRef.current) {
      cardFlipSoundRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // muting/unmutinf
  const toggleMute = () => {
    setIsMuted(!isMuted);
    playClickSound();
  };

  // sound effects
  const playClickSound = () => {
    if (clickSoundRef.current && !isMuted) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(e => console.log('Click sound failed'));
    }
  };

  const playCardFlipSound = () => {
    if (cardFlipSoundRef.current && !isMuted) {
      cardFlipSoundRef.current.currentTime = 0;
      cardFlipSoundRef.current.play().catch(e => console.log('Card flip sound failed'));
    }
  };

  const handleCardClick = (clickedCard) => {
    if (flippedCards.length === 2 || clickedCard.flipped || clickedCard.matched) return;

    // crunchy flip 
    playCardFlipSound();

    const newCards = cards.map(card =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, clickedCard]);
    
    if (flippedCards.length === 1) {
      setMoves(moves + 1);
    }
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      if (flippedCards[0].symbol === flippedCards[1].symbol) {
        // match found
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              flippedCards.some(flipped => flipped.id === card.id)
                ? { ...card, matched: true }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      } else {
        // no match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              flippedCards.some(flipped => flipped.id === card.id)
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1500);
      }
    }
  }, [flippedCards]);

  useEffect(() => {
    const allMatched = cards.every(card => card.matched);
    if (allMatched && cards.length > 0 && moves > 0 && !gameWon) {
      setGameWon(true);
      // saving record
      const newRecord = {
        moves: moves,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      const updatedRecords = [...records, newRecord]
        .sort((a, b) => a.moves - b.moves) // sort by moves (best first)
        .slice(0, 3); // keep only top 3
      setRecords(updatedRecords);
    }
  }, [cards, moves, gameWon, records]);

  const resetGame = () => {
    playClickSound();
    setCards(createDeck());
    setFlippedCards([]);
    setMoves(0);
    setGameWon(false);
    setShowRecords(false);
  };

  const handleShowRecords = () => {
    playClickSound();
    setShowRecords(true);
  };

  const handleCloseRecords = () => {
    playClickSound();
    setShowRecords(false);
  };

  const handleVictoryNewGame = () => {
    playClickSound();
    resetGame();
  };

  const handleVictoryRecords = () => {
    playClickSound();
    setShowRecords(true);
  };

  const handleVolumeSliderToggle = () => {
    playClickSound();
    setShowVolumeSlider(!showVolumeSlider);
  };
  
  return (
    <div style={styles.pageContainer}>
      {/* creative bg*/}
      <div style={styles.floatingLeaves}>
        {leafPositions.map((leaf) => (
          <div
            key={leaf.id}
            style={{
              ...styles.leaf,
              left: `${leaf.left}%`,
              top: `${leaf.top}%`,
              animationDelay: `${leaf.animationDelay}s`,
              animationDuration: `${leaf.animationDuration}s`,
            }}
          >
            🍂
          </div>
        ))}
      </div>

      <div style={styles.gameContainer}>
        {/* audio*/}
        <div style={styles.audioControls}>
          <button
            onClick={toggleMute}
            style={styles.audioButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <div style={styles.volumeContainer}>
            <button
              onClick={handleVolumeSliderToggle}
              style={styles.audioButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
              title="Volume Settings"
            >
              <Settings size={18} />
            </button>
            
            {showVolumeSlider && (
              <div style={styles.volumeSliderPopup}>
                <div style={styles.volumeSliderContainer}>
                  <span style={styles.volumeLabel}>Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      const progress = (newVolume / 1) * 100;
                      e.target.style.setProperty('--progress', `${progress}%`);
                    }}
                    style={{
                      ...styles.volumeSlider,
                      '--progress': `${(volume / 1) * 100}%`
                    }}
                  />
                  <span style={styles.volumeValue}>{Math.round(volume * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            🍂 Autumn Mysteries 🍂
          </h1>
          <p style={styles.subtitle}>
            Uncover the secrets hidden in the autumn mist...
          </p>
          <div style={styles.controls}>
            <span style={styles.movesCounter}>
              Moves: {moves}
            </span>
            <button
              onClick={resetGame}
              style={styles.button}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#b45309'}
            >
              New Game
            </button>
            <button
              onClick={handleShowRecords}
              style={styles.recordsButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2410c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              Records
            </button>
          </div>
        </div>

        {/* game board */}
        <div style={styles.gameBoard}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                ...styles.cardContainer,
                transform: card.matched ? 'scale(1)' : 'scale(1)',
                opacity: card.matched ? '0.75' : '1'
              }}
              onMouseEnter={(e) => {
                if (!card.flipped && !card.matched) {
                  e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
                } else {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{
                ...styles.card,
                transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {/* card back*/}
                <div style={styles.cardBack}>
                  <div style={styles.cardBackSymbol}>
                    🌙
                  </div>
                  <div style={styles.cardBackGlow}></div>
                </div>
                
                {/* card front */}
                <div style={{
                  ...styles.cardFront,
                  ...(card.matched ? styles.cardMatched : {})
                }}>
                  <span style={{
                    transform: card.matched ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}>
                    {card.symbol}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* victory popup */}
        {gameWon && (
          <div style={styles.overlay}>
            <div style={styles.victoryModal}>
              <div style={styles.victoryEmoji}>🎉</div>
              <h2 style={styles.victoryTitle}>
                Mystery Solved!
              </h2>
              <p style={styles.victoryText}>
                You uncovered all the autumn secrets in {moves} moves!
              </p>
              <div style={styles.victoryButtons}>
                <button
                  onClick={handleVictoryNewGame}
                  style={styles.victoryButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                >
                  Discover New Mysteries
                </button>
                <button
                  onClick={handleVictoryRecords}
                  style={styles.victoryRecordsButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                >
                  View Records
                </button>
              </div>
            </div>
          </div>
        )}

        {/* records screen */}
        {showRecords && (
          <div style={styles.overlay}>
            <div style={styles.recordsModal}>
              <div style={styles.recordsEmoji}>📜</div>
              <h2 style={styles.recordsTitle}>
                Records of Mystery
              </h2>
              
              {records.length === 0 ? (
                <p style={styles.noRecordsText}>No records yet. Play to create your legend!</p>
              ) : (
                <div style={styles.recordsContent}>
                  <div style={styles.bestRecord}>
                    <h3 style={styles.bestRecordTitle}>🏆 Best Record</h3>
                    <p style={styles.bestRecordMoves}>
                      {records[0].moves} moves
                    </p>
                    <p style={styles.bestRecordDate}>
                      {records[0].date} at {records[0].time}
                    </p>
                  </div>
                  
                  <div style={styles.recentRecords}>
                    <h3 style={styles.recentRecordsTitle}>Recent Games</h3>
                    {records.slice(0, 5).map((record, index) => (
                      <div key={index} style={styles.recordItem}>
                        <span style={styles.recordMoves}>{record.moves} moves</span>
                        <span style={styles.recordDate}>{record.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleCloseRecords}
                style={styles.closeButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: '1',
    width: '100%',
    height: '100%',
    padding: '20px',
    boxSizing: 'border-box'
  },
  gameContainer: {
    background: 'transparent',
    borderRadius: '1.2rem',
    padding: '1.2rem',
    maxWidth: '26rem',
    width: '100%',
    position: 'relative',
    zIndex: '10',
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(8px)',
    border: '2px solid rgba(217, 119, 6, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transform: 'scale(1.1)',
    transformOrigin: 'center'
  },
  audioControls: {
    position: 'absolute',
    top: '0.8rem',
    right: '0.8rem',
    display: 'flex',
    gap: '0.4rem',
    zIndex: '20'
  },
  audioButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(217, 119, 6, 0.3)',
    borderRadius: '0.4rem',
    padding: '0.4rem',
    color: '#fef3c7',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(4px)',
    width: '2.2rem',
    height: '2.2rem'
  },
  volumeContainer: {
    position: 'relative'
  },
  volumeSliderPopup: {
    position: 'absolute',
    top: '100%',
    right: '0',
    marginTop: '0.5rem',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(217, 119, 6, 0.3)',
    borderRadius: '0.6rem',
    padding: '0.8rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    minWidth: '10rem'
  },
  volumeSliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    alignItems: 'center'
  },
  volumeLabel: {
    color: '#fef3c7',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  volumeSlider: {
    width: '100%',
    height: '5px',
    borderRadius: '3px',
    background: '#4a5568',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    appearance: 'none',
    WebkitAppearance: 'none'
  },
  volumeValue: {
    color: '#fed7aa',
    fontSize: '0.7rem'
  },
  floatingLeaves: {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  leaf: {
    position: 'absolute',
    fontSize: '1.2rem',
    opacity: '0.1',
    animation: 'bounce 3s ease-in-out infinite'
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.2rem',
    marginTop: '1.5rem'
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#fef3c7',
    marginBottom: '0.4rem',
    filter: 'drop-shadow(0 20px 20px rgba(0, 0, 0, 0.25))',
    fontFamily: 'serif'
  },
  subtitle: {
    color: '#fed7aa',
    fontSize: '0.9rem',
    opacity: '0.9',
    fontWeight: '500',
    marginBottom: '0.8rem'
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.8rem',
    color: '#fef3c7',
    flexWrap: 'wrap'
  },
  movesCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    backdropFilter: 'blur(4px)',
    fontSize: '0.8rem'
  },
  button: {
    backgroundColor: '#b45309',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    border: 'none',
    fontWeight: '500',
    boxShadow: '0 8px 12px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem'
  },
  recordsButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    border: 'none',
    fontWeight: '500',
    boxShadow: '0 8px 12px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem'
  },
  gameBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.3rem',
    margin: '0 auto',
    justifyContent: 'center',
    width: 'fit-content'
  },
  cardContainer: {
    position: 'relative',
    width: '2.8rem',
    height: '2.8rem',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    perspective: '1000px'
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s ease'
  },
  cardBack: {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '0.6rem',
    background: 'linear-gradient(135deg, #92400e 0%, #c2410c 100%)',
    border: '2px solid #d97706',
    boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBackSymbol: {
    color: '#fcd34d',
    fontSize: '1.3rem',
    opacity: '0.6'
  },
  cardBackGlow: {
    position: 'absolute',
    inset: '0',
    borderRadius: '0.6rem',
    background: 'linear-gradient(135deg, transparent 0%, rgba(252, 211, 77, 0.2) 50%, transparent 100%)',
    opacity: '0.2'
  },
  cardFront: {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    borderRadius: '0.6rem',
    border: '2px solid #d97706',
    boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
    transition: 'all 0.4s ease'
  },
  cardMatched: {
    background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
    borderColor: '#16a34a',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  },
  overlay: {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '50',
    backdropFilter: 'blur(4px)'
  },
  victoryModal: {
    background: 'linear-gradient(135deg, #92400e 0%, #c2410c 100%)',
    padding: '1.2rem',
    borderRadius: '0.8rem',
    border: '2px solid #d97706',
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    animation: 'bounceOnce 0.6s ease-in-out',
    margin: '1rem',
    maxWidth: '20rem'
  },
  victoryEmoji: {
    fontSize: '2.5rem',
    marginBottom: '0.8rem'
  },
  victoryTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#fef3c7',
    marginBottom: '0.8rem',
    fontFamily: 'serif'
  },
  victoryText: {
    color: '#fed7aa',
    marginBottom: '1.2rem',
    fontSize: '0.9rem'
  },
  victoryButtons: {
    display: 'flex',
    gap: '0.6rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  victoryButton: {
    backgroundColor: '#d97706',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.4rem',
    border: 'none',
    fontWeight: 'bold',
    boxShadow: '0 8px 12px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem'
  },
  victoryRecordsButton: {
    backgroundColor: '#ea580c',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.4rem',
    border: 'none',
    fontWeight: 'bold',
    boxShadow: '0 8px 12px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem'
  },
  recordsModal: {
    background: 'linear-gradient(135deg, #92400e 0%, #c2410c 100%)',
    padding: '1.2rem',
    borderRadius: '0.8rem',
    border: '2px solid #d97706',
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
    maxWidth: '20rem',
    width: '100%',
    margin: '0 1rem'
  },
  recordsEmoji: {
    fontSize: '1.8rem',
    marginBottom: '0.8rem'
  },
  recordsTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#fef3c7',
    marginBottom: '1.2rem',
    fontFamily: 'serif'
  },
  noRecordsText: {
    color: '#fed7aa',
    marginBottom: '1.2rem',
    fontSize: '0.9rem'
  },
  recordsContent: {
    marginBottom: '1.2rem'
  },
  bestRecord: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '0.4rem',
    padding: '0.8rem',
    marginBottom: '0.8rem'
  },
  bestRecordTitle: {
    color: '#fcd34d',
    fontWeight: 'bold',
    marginBottom: '0.4rem',
    fontSize: '0.9rem'
  },
  bestRecordMoves: {
    color: '#fef3c7',
    fontSize: '1rem'
  },
  bestRecordDate: {
    color: '#fed7aa',
    fontSize: '0.8rem'
  },
  recentRecords: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '0.4rem',
    padding: '0.8rem'
  },
  recentRecordsTitle: {
    color: '#fcd34d',
    fontWeight: 'bold',
    marginBottom: '0.4rem',
    fontSize: '0.9rem'
  },
  recordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.2rem 0',
    borderBottom: '1px solid #d97706'
  },
  recordMoves: {
    color: '#fef3c7',
    fontSize: '0.8rem'
  },
  recordDate: {
    color: '#fed7aa',
    fontSize: '0.8rem'
  },
  closeButton: {
    backgroundColor: '#d97706',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.4rem',
    border: 'none',
    fontWeight: 'bold',
    boxShadow: '0 8px 12px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem'
  }
};

// basic animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes bounceOnce {
    0% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-12px) scale(1.05); }
    100% { transform: translateY(0) scale(1); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Custom volume slider styling - FIXED: Smooth and with progress */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type="range"]::-webkit-slider-track {
    background: linear-gradient(to right, #d97706 0%, #d97706 var(--progress, 50%), #4a5568 var(--progress, 50%), #4a5568 100%);
    height: 5px;
    border-radius: 3px;
    transition: all 0.2s ease;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    background: #d97706;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    border: 2px solid #ffffff;
    transition: all 0.15s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  }

  input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(0.95);
  }

  input[type="range"]::-moz-range-track {
    background: linear-gradient(to right, #d97706 0%, #d97706 var(--progress, 50%), #4a5568 var(--progress, 50%), #4a5568 100%);
    height: 5px;
    border-radius: 3px;
    border: none;
    transition: all 0.2s ease;
  }

  input[type="range"]::-moz-range-thumb {
    background: #d97706;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: all 0.15s ease;
  }

  input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  }

  input[type="range"]::-moz-range-thumb:active {
    transform: scale(0.95);
  }
`;

// progress bar thingy
const updateSliderProgress = () => {
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const progress = (slider.value / slider.max) * 100;
    slider.style.setProperty('--progress', `${progress}%`);
  });
};

if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
  setTimeout(updateSliderProgress, 100);
}

export default MemoryGame;