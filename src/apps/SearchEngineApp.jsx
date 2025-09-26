import React, { useState, useEffect, useRef } from 'react';
import './SearchEngine.css';

const SearchEngine = () => {
  const [selectedEngine, setSelectedEngine] = useState('google');
  const [searchQuery, setSearchQuery] = useState('');
  
  // audio refs
  const clickSoundRef = useRef(null);
  const keyboardSoundRef = useRef(null);

  // setup audio
  useEffect(() => {
    clickSoundRef.current = new Audio('/click.mp3');
    clickSoundRef.current.volume = 0.3;
    
    keyboardSoundRef.current = new Audio('/click.mp3');
    keyboardSoundRef.current.volume = 0.2;
  }, []);

  // function to play click sound
  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(error => {
        console.log("Click sound play failed:", error);
      });
    }
  };

  // function to play keyboard sound
  const playKeyboardSound = () => {
    if (keyboardSoundRef.current) {
      keyboardSoundRef.current.currentTime = 0;
      keyboardSoundRef.current.play().catch(error => {
        console.log("Keyboard sound play failed:", error);
      });
    }
  };

  // handle Enter key press in search input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    };

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', handleKeyPress);
    }

    return () => {
      if (searchInput) {
        searchInput.removeEventListener('keypress', handleKeyPress);
      }
    };
  }, []);

  const selectEngine = (engine) => {
    playClickSound();
    setSelectedEngine(engine);
  };

  const performSearch = () => {
    playClickSound();
    const query = searchQuery.trim();
    if (!query) {
      alert('Please enter a search query!');
      return;
    }

    let searchUrl;
    if (selectedEngine === 'google') {
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    } else {
      searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }

    window.open(searchUrl, '_blank');
  };

  const searchFor = (query) => {
    playClickSound();
    setSearchQuery(query);
    setTimeout(() => performSearch(), 100);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // typing sounds
  const handleKeyDown = (e) => {
    // play keyboard sound for all key presses except modifier keys
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      playKeyboardSound();
    }
  };

  return (
    <div className="app-container">
      <div className="screen">
        <div className="header">
          <div className="title">AUTUMN SEARCH</div>
          <div className="subtitle">~ Retro Terminal v1.0 ~</div>
        </div>

        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Enter your search query..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} 
            />
            <button className="search-btn" onClick={performSearch}>
              SEARCH
            </button>
          </div>
          
          <div className="engine-selector">
            <div
              className={`engine-option ${selectedEngine === 'google' ? 'active' : ''}`}
              data-engine="google"
              onClick={() => selectEngine('google')}
            >
              GOOGLE
            </div>
            <div
              className={`engine-option ${selectedEngine === 'duckduckgo' ? 'active' : ''}`}
              data-engine="duckduckgo"
              onClick={() => selectEngine('duckduckgo')}
            >
              DUCKDUCKGO
            </div>
          </div>
        </div>

        <div className="news-section">
          <div className="news-title">// AUTUMN HEADLINES //</div>
          <div className="news-cards">
            <div className="news-card" onClick={() => searchFor('September autumn weather')}>
              <div className="news-headline">September is Here: The Season of Change Begins</div>
              <div className="news-date">Sep 17, 2025</div>
            </div>
            <div className="news-card" onClick={() => searchFor('seasonal depression autumn')}>
              <div className="news-headline">Kaoru Hakaze: "September Makes Me Melancholy"</div>
              <div className="news-date">Sep 16, 2025</div>
            </div>
            <div className="news-card" onClick={() => searchFor('autumn leaves fall foliage 2025')}>
              <div className="news-headline">Peak Foliage: Nature's Greatest Show Returns</div>
              <div className="news-date">Sep 15, 2025</div>
            </div>
          </div>
        </div>

        <div className="footer">
          © 2025 Autumn Search Terminal
        </div>
      </div>
    </div>
  );
};

export default SearchEngine;