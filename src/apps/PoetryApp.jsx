/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

const WhispersOfSeptember = () => {
  const poems = [
    {
      text: "“I’m a strong believer that actions speak louder than words. But in my case, my thoughts speak louder than actions.”",
      author: "Saiki Kusuo"
    },
    {
      text: "“I’ve been holding my breath to stay focused … Taking a breather is not slacking.”",
      author: "Yatora Yaguchi"
    },
    {
      text: "“It doesn’t matter what gender, race or world you originated from. It doesn’t matter if you are strong or weak, famous or not famous. Anything is okay. What I am looking for is passion. I hope you have the passion to see the end of this damn story with me.”",
      author: "Kim Dokja"
    },
    {
      text: "“Talented people are cheaters. They get to improve without much work.”",
      author: "Yatora Yaguchi"
    },
    {
      text: "“If I fail, it’s my fault. If I pass, it’s all thanks to me.”",
      author: "Yatora Yaguchi"
    },
    {
      text: "“The story changed every time I read it. The story was over but it wasn’t over.\n The story wouldn’t end unless the reader gave up on the story.”",
      author: "Singshong"
    },
    {
      text: "“If you have time to fantasize about a beautiful end, then live beautifully ’til the end.”",
      author: "Sakata Gintoki"
    },
    {
      text: "“Life is like a mountain – you can say you’ve reached the top, but only after climbing back down.”",
      author: "Sakata Gintoki"
    },
    {
      text: "“Honest feelings can sometimes lead to cruel endings.”",
      author: "Sakata Gintoki"
    },
    {
      text: "“I’m not antisocial; I’m just selective with who I interact with.”",
      author: "Saiki Kusuo"
    },
    {
      text: "“The only lesson that humans can learn from history is that humans do not gain any lessons from history, and they're always repeating the same tragedies.”",
      author: "extracted from the novel, Lord of the Mysteries"
    },
    {
      text: "“Courage is not the absence of fear, but the will to face it.”",
      author: "Jean - Genshin Impact"
    },
    {
      text: "“The oldest and strongest emotion of mankind is fear, and the oldest and strongest fear is the fear of the unknown.”",
      author: "Klein Moretti"
    },
    {
      text: "“Life is basically like a soap bubble. It rides on the wind, flying here and there… and before you realise it – pop! It’s gone.”",
      author: "Sakata Gintoki"
    },
    {
      text: "“Free things cost the most.”",
      author: "Klein Moretti"
    },
    {
      text: "“Isn't it just natural to put everything you have into pursuing your passion?”",
      author: "Masako Saeki"
    },{
      text: "“People who are true to themselves make great art. Art is a language without words.”",
      author: "Masako Saeki"
    },{
      text: "“I’m not talented. I just spend more time thinking about art than others. Also, it’s necessary to study methods in order to make art. So just brushing it off as ‘talent’ is like I haven’t put any effort into it.”",
      author: "Maru Mori"
    },
    {
      text: "“What you consider normal often turns out to be what makes you, you.”",
      author: "Ooba Mayu"
    },
    {
      text: "“Your goal shouldn’t be to create a work that gets first place, it should be to create your very own masterpiece.”",
      author: "Masako Saeki"
    },
    {
      text: "“But I’ve realized now, as long as I’m bein’ myself, I’ll always have somewhere I can fit in.”",
      author: "Ryuji Sakamoto"
    },
    {
      text: "“Wherever you decide to be, that’s where you belong.”",
      author: "Ryuji Sakamoto"
    },
    {
      text: "“Fate never repeats itself indefinitely. It always brings us some surprises.”",
      author: "Klein Moretti"
    },
    {
      text: "“A person should be rash when the time calls for it, and be a coward when necessary!”",
      author: "Klein Moretti"
    },
    {
      text: "“Happiness depends on each person. If you think you’re happy, then you must be happy.”",
      author: "Sakata Gintoki"
    },
    {
      text: "“The night is darkest just before dawn. But keep your eyes open; if you avert your eyes from the dark, you’ll be blind to the rays of a new day… \nSo keep your eyes open, no matter how dark the night ahead may be.”",
      author: "Sakata Gintoki"
    },
    {
      text: "“You yourself have to change first, or nothing will change for you!”",
      author: "Sakata Gintoki"
    },
    {
      text: "“Even when you’re doing what you love it isn’t always gonna be fun.”",
      author: "Yatora Yaguchi"
    },
    {
      text: "“Maybe I’m not talented, but I’m risking everything for now.”",
      author: "Yatora Yaguchi"
    },
    {
      text: "“An apology is a promise to do things differently next time, and to keep the promise.”",
      author: "Gon Freecss"
    },
    {
      text: "“Don’t ever give up. Even if it’s painful, even if it’s agonizing, don’t try to take the easy way out.”",
      author: "Zenitsu Agatsuma"
    },
    {
      text: "“The only thing we’re allowed to do is to believe that we won’t regret the choice we made.”",
      author: "Levi Ackerman"
    },
    {
      text: "“A win means nothing if you don’t have fun.”",
      author: "Shōyō Hinata"
    },
    {
      text: "“If you fail to move forward, that’s the very definition of stagnation. Water that doesn’t flow begins to rot.”",
      author: "The Apothecary Diaries (Light Novel, Vol. 9)"
    },
    {
      text: "“Being at the peak may mean you are mere moments from your downfall.”",
      author: "Igor"
    },
    {
      text: "“I was an ordinary person with ordinary skills. But even so, this didn’t mean I could only do ordinary things.”",
      author: "Kim Dokja"
    },
  ];

  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [savedPoems, setSavedPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('poems');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [copyButtonText, setCopyButtonText] = useState('📋 Copy Text');

  const poemCardRef = useRef(null);
  const clickSoundRef = useRef(null);
  const calmMusicRef = useRef(null);
  const cardFlipRef = useRef(null);

  const playClickSound = () => {
    if (isSoundOn && clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  const playCardFlipSound = () => {
    if (isSoundOn && cardFlipRef.current) {
      cardFlipRef.current.currentTime = 0;
      cardFlipRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  const toggleAllSounds = (soundOn) => {
    if (calmMusicRef.current) {
      if (soundOn) {
        calmMusicRef.current.play().catch(e => console.log("Music play error:", e));
      } else {
        calmMusicRef.current.pause();
      }
    }
  };

  useEffect(() => {
    displayRandomPoem();
    
    clickSoundRef.current = new Audio('./click.mp3');
    clickSoundRef.current.volume = 0.3;
    
    calmMusicRef.current = new Audio('./calm-music.mp3');
    calmMusicRef.current.loop = true;
    calmMusicRef.current.volume = 0.4;
    
    cardFlipRef.current = new Audio('./cardflip.mp3');
    cardFlipRef.current.volume = 0.5;
    
    if (isSoundOn) {
      calmMusicRef.current.play().catch(e => console.log("Music play error:", e));
    }

    return () => {
      if (calmMusicRef.current) {
        calmMusicRef.current.pause();
      }
    };
  }, []);

  const displayRandomPoem = () => {
    playClickSound();
    playCardFlipSound();
    setIsLoading(true);
    
    setTimeout(() => {
      const newIndex = Math.floor(Math.random() * poems.length);
      setCurrentPoemIndex(newIndex);
      setIsLoading(false);
      
      if (poemCardRef.current) {
        poemCardRef.current.style.transform = 'translateY(10px)';
        poemCardRef.current.style.opacity = '0.7';
        
        setTimeout(() => {
          if (poemCardRef.current) {
            poemCardRef.current.style.transform = 'translateY(0)';
            poemCardRef.current.style.opacity = '1';
          }
        }, 100);
      }
    }, 600);
  };

  const toggleTheme = () => {
    playClickSound();
    setIsNightMode(!isNightMode);
  };

  const toggleSound = () => {
    playClickSound();
    const newSoundState = !isSoundOn;
    setIsSoundOn(newSoundState);
    toggleAllSounds(newSoundState);
  };

  const savePoemToScrapbook = () => {
    playClickSound();
    const currentPoem = poems[currentPoemIndex];
    const poemId = currentPoem.text + currentPoem.author;
    
    if (savedPoems.some(p => p.text + p.author === poemId)) {
      setSaveButtonText('Already Saved!');
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
      return;
    }
    
    setSavedPoems([...savedPoems, currentPoem]);
    
    setSaveButtonText('Saved!');
    setTimeout(() => {
      setSaveButtonText('Save');
    }, 2000);
  };

  const expandPoem = (index) => {
    playClickSound();
    const poem = savedPoems[index];
    alert(`"${poem.text}"\n\n— ${poem.author}`);
  };

  const removePoem = (index) => {
    playClickSound();
    if (window.confirm('Remove this whisper from your scrapbook?')) {
      const newSavedPoems = [...savedPoems];
      newSavedPoems.splice(index, 1);
      setSavedPoems(newSavedPoems);
    }
  };

  const getCurrentPoemText = () => {
    const poem = poems[currentPoemIndex];
    return `"${poem.text}"\n\n— ${poem.author}\n\nShared from Whispers of This Autumn 🍂`;
  };

  const shareToTwitter = (e) => {
    e.preventDefault();
    playClickSound();
    const text = getCurrentPoemText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = (e) => {
    e.preventDefault();
    playClickSound();
    const text = getCurrentPoemText();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = (e) => {
    e.preventDefault();
    playClickSound();
    const text = getCurrentPoemText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = (e) => {
    e.preventDefault();
    playClickSound();
    const text = getCurrentPoemText();
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    playClickSound();
    const text = getCurrentPoemText();
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopyButtonText('✅ Copied!');
        setTimeout(() => {
          setCopyButtonText('📋 Copy Text');
        }, 2000);
      }).catch(() => {
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopyButtonText('✅ Copied!');
      setTimeout(() => {
        setCopyButtonText('📋 Copy Text');
      }, 2000);
    } catch (err) {
      alert('Failed to copy text. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
  };

  const shareNative = () => {
    playClickSound();
    const text = getCurrentPoemText();
    
    if (navigator.share) {
      navigator.share({
        title: 'Whispers of this Autumn',
        text: text,
        url: window.location.href
      }).catch(err => {
        console.log('Share failed:', err);
      });
    } else {
      copyToClipboard();
    }
  };

  const currentPoem = poems[currentPoemIndex];

  const styles = {
    poetryApp: {
    fontFamily: "'Courier Prime', monospace",
    background: 'transparent',
    color: isNightMode ? '#080b3fff' : '#2c1810',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    width: '100%', 
    height: '100%', 
    maxWidth: '400px', 
    maxHeight: '430px', 
    background: 'transparent',
    border: isNightMode 
      ? '3px solid #533483'
      : '3px solid #d4c4a8',
    borderRadius: '15px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: isNightMode
    ? '0 0 0 1px rgba(255,255,255,0.1), 0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 0 0 1px rgba(0,0,0,0.1), 0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
  transition: 'all 0.6s ease',
  display: 'flex',
  flexDirection: 'column'
},
    containerBefore: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isNightMode
        ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(233,69,96,0.05) 2px, rgba(233,69,96,0.05) 4px)'
        : 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      pointerEvents: 'none',
      zIndex: 100
    },
    topControls: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      display: 'flex',
      gap: '8px',
      zIndex: 200
    },
    controlBtn: {
      width: '28px',
      height: '28px',
      border: isNightMode 
        ? '2px solid #533483'
        : '2px solid #d4c4a8',
      background: isNightMode ? '#0f3460' : '#f9f6ef',
      color: isNightMode ? '#eee6d3' : '#2c1810',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
    },
    activeControlBtn: {
      background: isNightMode ? '#e94560' : '#8b4513',
      color: 'white',
      borderColor: isNightMode ? '#e94560' : '#8b4513'
    },
    header: {
      textAlign: 'center',
      padding: '35px 10px 15px',
      borderBottom: isNightMode 
        ? '2px dashed #533483'
        : '2px dashed #d4c4a8',
      flexShrink: 0
    },
    appTitle: {
      fontFamily: "'Special Elite', cursive",
      fontSize: '1.4rem',
      marginBottom: '5px',
      textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '0.75rem',
      opacity: 0.7,
      fontStyle: 'italic',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    content: {
      padding: '15px',
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      display: 'flex',
      flexDirection: 'column'
    },
    navButtons: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexShrink: 0
    },
    navBtn: {
      flex: 1,
      padding: '8px',
      background: isNightMode ? '#0f3460' : '#f9f6ef',
      color: isNightMode ? '#eee6d3' : '#2c1810',
      border: isNightMode 
        ? '2px solid #533483'
        : '2px solid #d4c4a8',
      borderRadius: '6px',
      cursor: 'pointer',
      fontFamily: "'Courier Prime', monospace",
      fontSize: '0.7rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      transition: 'all 0.3s ease'
    },
    activeNavBtn: {
      background: isNightMode ? '#e94560' : '#8b4513',
      color: 'white',
      borderColor: isNightMode ? '#e94560' : '#8b4513'
    },
    poemCard: {
      background: isNightMode ? '#f9f6ef' : '#f9f6ef',
      border: isNightMode 
        ? '2px solid #533483'
        : '2px solid #d4c4a8',
      borderRadius: '8px',
      padding: '15px 12px',
      marginBottom: '12px',
      position: 'relative',
      transition: 'all 0.5s ease',
      boxShadow: isNightMode
        ? '2px 2px 0px #533483, 0 0 0 1px rgba(255,255,255,0.05)'
        : '2px 2px 0px #d4c4a8, 0 0 0 1px rgba(0,0,0,0.05)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    },
    poemCardBefore: {
      position: 'absolute',
      left: '6px',
      top: '10px',
      bottom: '10px',
      width: '4px',
      background: isNightMode
        ? `radial-gradient(circle, #1a1a2e 40%, transparent 40%), #0f3460`
        : `radial-gradient(circle, #f4f1e8 40%, transparent 40%), #f9f6ef`,
      backgroundSize: '4px 15px',
      backgroundRepeat: 'repeat-y'
    },
    poemText: {
      fontSize: '0.8rem',
      lineHeight: '1.5',
      margin: '0 0 10px 15px',
      whiteSpace: 'pre-line',
      fontWeight: '400',
      flex: 1,
      overflowY: 'auto'
    },
    poemAuthor: {
      fontSize: '0.75rem',
      textAlign: 'right',
      marginRight: '8px',
      fontStyle: 'italic',
      opacity: 0.8,
      flexShrink: 0
    },
    actionButtons: {
      display: 'grid',
      gridTemplateColumns: '0.8fr 0.8fr',
      gap: '8px',
      flexShrink: 0
    },
    actionBtn: {
      padding: '8px 12px',
      background: isNightMode ? '#e94560' : '#8b4513',
      color: 'white',
      border: isNightMode 
        ? '2px solid #e94560'
        : '2px solid #8b4513',
      borderRadius: '6px',
      cursor: 'pointer',
      fontFamily: "'Courier Prime', monospace",
      fontSize: '0.7rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.3s ease',
      boxShadow: '1px 1px 0px rgba(0,0,0,0.2)'
    },
    fullWidthActionBtn: {
      gridColumn: '1 / -1'
    },
    scrapbook: {
      display: activeSection === 'scrapbook' ? 'flex' : 'none',
      flex: 1,
      overflowY: 'auto',
      flexDirection: 'column'
    },
    savedPoem: {
      background: isNightMode ? '#f9f6ef' : '#f9f6ef',
      border: isNightMode 
        ? '2px solid #533483'
        : '2px solid #d4c4a8',
      borderRadius: '6px',
      padding: '10px',
      marginBottom: '10px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: 'rotate(-0.5deg)',
      flexShrink: 0
    },
    savedPoemEven: {
      transform: 'rotate(0.5deg)'
    },
    savedPoemText: {
      fontSize: '0.7rem',
      lineHeight: '1.4',
      margin: '0 0 8px 0',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    savedPoemAuthor: {
      fontSize: '0.65rem',
      margin: '0',
      fontStyle: 'italic',
      opacity: 0.8
    },
    deleteBtn: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      width: '16px',
      height: '16px',
      background: isNightMode ? '#e94560' : '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '10px',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loading: {
      textAlign: 'center',
      padding: '30px 15px',
      fontStyle: 'italic',
      fontSize: '0.8rem'
    },
    loadingAfter: {
      display: 'block',
      width: '20px',
      height: '20px',
      border: isNightMode 
        ? '2px solid #533483'
        : '2px solid #d4c4a8',
      borderTop: isNightMode 
        ? '2px solid #e94560'
        : '2px solid #8b4513',
      borderRadius: '50%',
      margin: '15px auto 0',
      animation: 'spin 1s linear infinite'
    },
    emptyScrapbook: {
      textAlign: 'center',
      padding: '40px 15px',
      opacity: 0.6,
      fontStyle: 'italic',
      fontSize: '0.8rem',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    shareModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: shareModalOpen ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    shareContent: {
      background: isNightMode ? '#16213e' : '#faf7f0',
      border: isNightMode 
        ? '3px solid #533483'
        : '3px solid #d4c4a8',
      borderRadius: '15px',
      padding: '25px',
      maxWidth: '300px',
      width: '85%',
      textAlign: 'center'
    },
    shareTitle: {
      fontFamily: "'Special Elite', cursive",
      fontSize: '1.1rem',
      marginBottom: '15px'
    },
    shareButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '15px'
    },
    shareBtn: {
      padding: '8px',
      border: isNightMode 
        ? '2px solid #533483'
        : '2px solid #d4c4a8',
      background: isNightMode ? '#0f3460' : '#f9f6ef',
      color: isNightMode ? '#eee6d3' : '#2c1810',
      borderRadius: '6px',
      cursor: 'pointer',
      fontFamily: "'Courier Prime', monospace",
      fontSize: '0.7rem',
      fontWeight: '700',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px',
      transition: 'all 0.3s ease'
    },
    shareBtnHover: {
      background: isNightMode ? '#e94560' : '#8b4513',
      color: 'white',
      borderColor: isNightMode ? '#e94560' : '#8b4513',
      transform: 'translateY(-1px)'
    },
    closeModal: {
      background: isNightMode ? '#e94560' : '#8b4513',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontFamily: "'Courier Prime', monospace",
      fontWeight: '700',
      fontSize: '0.8rem'
    }
  };

  return (
    <div style={styles.poetryApp}>
      <div style={styles.appContainer}>
        <div style={styles.containerBefore}></div>
        
        {/* top controls */}
        <div style={styles.topControls}>
          <button 
            style={{
              ...styles.controlBtn,
              ...(isNightMode ? styles.activeControlBtn : {})
            }}
            onClick={toggleTheme}
            title="Toggle Night Mode"
          >
            {isNightMode ? '☀️' : '🌙'}
          </button>
          <button 
            style={{
              ...styles.controlBtn,
              ...(isSoundOn ? styles.activeControlBtn : {})
            }}
            onClick={toggleSound}
            title="Toggle Sound"
          >
            {isSoundOn ? '🔊' : '🔇'}
          </button>
        </div>
        
        {/* header */}
        <div style={styles.header}>
          <h1 style={styles.appTitle}>WHISPERS OF AUTUMN</h1>
          <p style={styles.subtitle}>Give them a thought.. maybe..?</p>
        </div>
        
        {/* content */}
        <div style={styles.content}>
          {/* navigation */}
          <div style={styles.navButtons}>
            <button 
              style={{
                ...styles.navBtn,
                ...(activeSection === 'poems' ? styles.activeNavBtn : {})
              }}
              onClick={() => {
                playClickSound();
                setActiveSection('poems');
              }}
            >
              WHISPERS
            </button>
            <button 
              style={{
                ...styles.navBtn,
                ...(activeSection === 'scrapbook' ? styles.activeNavBtn : {})
              }}
              onClick={() => {
                playClickSound();
                setActiveSection('scrapbook');
              }}
            >
              SCRAPBOOK
            </button>
          </div>
          
          {/*main content */}
          {activeSection === 'poems' && (
            <div>
              <div style={styles.poemCard} ref={poemCardRef}>
                <div style={styles.poemCardBefore}></div>
                {isLoading ? (
                  <div style={styles.loading}>
                    Loading whisper...
                    <div style={styles.loadingAfter}></div>
                  </div>
                ) : (
                  <>
                    <div style={styles.poemText}>{currentPoem.text}</div>
                    <div style={styles.poemAuthor}>— {currentPoem.author}</div>
                  </>
                )}
              </div>
              
              {!isLoading && (
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.actionBtn} 
                    onClick={displayRandomPoem}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '1px 1px 0px rgba(0,0,0,0.2)';
                    }}
                  >
                    Next
                  </button>
                  <button 
                    style={styles.actionBtn} 
                    onClick={savePoemToScrapbook}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '1px 1px 0px rgba(0,0,0,0.2)';
                    }}
                  >
                    {saveButtonText}
                  </button>
                  <button 
                    style={{...styles.actionBtn, ...styles.fullWidthActionBtn}} 
                    onClick={() => {
                      playClickSound();
                      setShareModalOpen(true);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '1px 1px 0px rgba(0,0,0,0.2)';
                    }}
                  >
                    📤 Share Whisper
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* scrapbook */}
          <div style={styles.scrapbook}>
            {savedPoems.length === 0 ? (
              <div style={styles.emptyScrapbook}>
                Your scrapbook is empty.<br />Save some whispers to revisit them here!
              </div>
            ) : (
              savedPoems.map((poem, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.savedPoem,
                    ...(index % 2 === 1 ? styles.savedPoemEven : {})
                  }} 
                  onClick={() => expandPoem(index)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'rotate(0deg) scale(1.02)';
                    e.target.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.2)';
                    const deleteBtn = e.target.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.style.display = 'flex';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = index % 2 === 1 ? 'rotate(0.5deg) scale(1)' : 'rotate(-0.5deg) scale(1)';
                    e.target.style.boxShadow = 'none';
                    const deleteBtn = e.target.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.style.display = 'none';
                  }}
                >
                  <button 
                    className="delete-btn"
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removePoem(index);
                    }}
                  >
                    ×
                  </button>
                  <div style={styles.savedPoemText}>{poem.text}</div>
                  <div style={styles.savedPoemAuthor}>— {poem.author}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* share modal*/}
        <div style={styles.shareModal} onClick={(e) => {
          if (e.target === e.currentTarget) {
            playClickSound();
            setShareModalOpen(false);
          }
        }}>
          <div style={styles.shareContent}>
            <h3 style={styles.shareTitle}>Share This Whisper</h3>
            <div style={styles.shareButtons}>
              <a 
                href="#" 
                style={styles.shareBtn} 
                onClick={shareToTwitter}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.shareBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.shareBtn)}
              >
                🐦 Twitter
              </a>
              <a 
                href="#" 
                style={styles.shareBtn} 
                onClick={shareToFacebook}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.shareBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.shareBtn)}
              >
                📘 Facebook
              </a>
              <a 
                href="#" 
                style={styles.shareBtn} 
                onClick={shareToWhatsApp}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.shareBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.shareBtn)}
              >
                💬 WhatsApp
              </a>
              <a 
                href="#" 
                style={styles.shareBtn} 
                onClick={shareToTelegram}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.shareBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.shareBtn)}
              >
                ✈️ Telegram
              </a>
              <button 
                style={styles.shareBtn} 
                onClick={copyToClipboard}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.shareBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.shareBtn)}
              >
                {copyButtonText}
              </button>
              <button 
                style={styles.shareBtn} 
                onClick={shareNative}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.shareBtnHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.shareBtn)}
              >
                📱 More Options
              </button>
            </div>
            <button 
              style={styles.closeModal} 
              onClick={() => {
                playClickSound();
                setShareModalOpen(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* keyframes for spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WhispersOfSeptember;