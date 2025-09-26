import React, { useState, useEffect, useRef } from 'react';
import './WeatherApp.css'

const WeatherApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [timezone, setTimezone] = useState(null);
  const [currentTime, setCurrentTime] = useState('--:--:--');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const API_KEY = '622253bfa9d1c6db55c97b180dc9ec0f';
  const API_BASE = 'https://api.openweathermap.org/data/2.5';
  const GEO_API = 'https://api.openweathermap.org/geo/1.0';

  const suggestionsRef = useRef(null);
  const locationInputRef = useRef(null);
  // audio ref
  const clickAudioRef = useRef(null);

  // setup audio
  useEffect(() => {
    clickAudioRef.current = new Audio('/click.mp3');
    clickAudioRef.current.preload = 'auto';
    clickAudioRef.current.volume = 0.5; 
  }, []);

  // click sound function
  const playClickSound = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0; 
      clickAudioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  // Toggle dark mode //NO NEED ANYMORE
  const toggleDarkMode = () => {
    playClickSound();
    setDarkMode(!darkMode);
  };

  // handle location input changes with debounce
  useEffect(() => {
    if (locationInput.length > 2) {
      const timer = setTimeout(() => {
        fetchLocationSuggestions(locationInput);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [locationInput]);

  // handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        locationInputRef.current !== event.target
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // clock
  useEffect(() => {
    const timer = setInterval(() => {
      updateClock();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timezone]);

  // fetch location suggestions
  const fetchLocationSuggestions = async (query) => {
    try {
      const response = await fetch(`${GEO_API}/direct?q=${query}&limit=5&appid=${API_KEY}`);
      const locations = await response.json();
      setSuggestions(locations);
      setShowSuggestions(locations.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // search weather
  const searchWeather = async () => {
    playClickSound();
    const location = locationInput.trim();
    if (!location) return;

    setLoading(true);
    setShowSuggestions(false);
    setErrorMessage('');

    try {
      // get coordinates for the location
      const geoResponse = await fetch(`${GEO_API}/direct?q=${location}&limit=1&appid=${API_KEY}`);
      const geoData = await geoResponse.json();
      
      if (geoData.length === 0) {
        showError('Location not found. Please try again.');
        setLoading(false);
        return;
      }

      // eslint-disable-next-line no-unused-vars
      const { lat, lon, name, country } = geoData[0];

      // get weather data
      const weatherResponse = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      const weatherData = await weatherResponse.json();
      
      if (weatherData.cod !== 200) {
        showError('Error fetching weather data. Please try again.');
        setLoading(false);
        return;
      }
      
      setTimezone(weatherData.timezone);
      setWeatherData(weatherData);
      setCurrentScreen('weather');
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      showError('Error fetching weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // show error message
  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  // update clock
  const updateClock = () => {
    if (timezone !== null) {
      const now = new Date();
      // calculate time based on timezone offset (timezone is in seconds, convert to ms)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const locationTime = new Date(utc + (1000 * timezone));
      
      let hours = locationTime.getHours();
      const minutes = locationTime.getMinutes().toString().padStart(2, '0');
      const seconds = locationTime.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      
      setCurrentTime(`${hours}:${minutes}:${seconds} ${ampm}`);
    } else {
      setCurrentTime("--:--:--");
    }
  };

  // format time from timestamp
  const formatTimeFromTimestamp = (timestamp) => {
    if (!timezone) return "--:--";
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // eslint-disable-next-line no-unused-vars
    const locationTime = new Date(utc + (1000 * timezone));
    
    const date = new Date(timestamp * 1000);
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const adjustedTime = new Date(utcTime + (1000 * timezone));
    
    const hours = adjustedTime.getHours().toString().padStart(2, '0');
    const minutes = adjustedTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // weather advice
  const getWeatherAdvice = (weather) => {
    const advice = {
      'Clear': "It's sunny! Don't forget your sunscreen and stay hydrated.",
      'Clouds': "Cloudy skies today. Perfect weather for outdoor activities!",
      'Rain': "It's raining today. Plan your outings carefully and carry an umbrella.",
      'Drizzle': "Light drizzle outside. A light jacket should be sufficient.",
      'Thunderstorm': "Thunderstorms expected. Stay indoors and stay safe!",
      'Snow': "Snowy weather! Bundle up warm and watch your step.",
      'Mist': "Misty conditions. Drive carefully and visibility may be reduced.",
      'Fog': "Foggy weather ahead. Take extra care while traveling.",
    };
    return advice[weather] || "Have a great day and dress according to the weather!";
  };

  // suggestion selection
  const handleSuggestionClick = (location) => {
    playClickSound();
    setLocationInput(location.name);
    setShowSuggestions(false);
    searchWeather();
  };

  // details popup
  const showDetailsPopup = () => {
    playClickSound();
    setShowPopup(true);
  };

  // close popup
  const closePopup = () => {
    playClickSound();
    setShowPopup(false);
  };

  // back to home
  const goBackHome = () => {
    playClickSound();
    setCurrentScreen('home');
  };

  // handle key press on location input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`} style={styles.appContainer}>
      <div 
        className={`mode-toggle ${darkMode ? 'dark' : ''}`} 
        onClick={toggleDarkMode}
        style={styles.modeToggle}
      ></div>
      
      {/*home screen */}
      <div className={`screen ${currentScreen === 'home' ? 'active' : ''}`} style={currentScreen === 'home' ? styles.screenActive : styles.screen}>
        <div style={styles.homeScreen}>
          <div className="character-placeholder">
            <img 
              src="./assets/kaoru.gif" 
              alt="Kaoru Character"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
              onError={(e) => {
                //  if GIF doesn't load
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = 'ZOZAS WEATHER APP LOL';
              }}
            />
          </div>
          
          <div style={styles.locationInputContainer}>
            <div style={{ position: 'relative' }} ref={suggestionsRef}>
              <input
                type="text"
                className="location-input"
                style={styles.locationInput}
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter location..."
                ref={locationInputRef}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestions}>
                  {suggestions.map((location, index) => (
                    <div
                      key={index}
                      style={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(location)}
                    >
                      {`${location.name}, ${location.country}${location.state ? `, ${location.state}` : ''}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              style={styles.searchButton} 
              onClick={searchWeather}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* forecasting screen */}
      <div className={`screen ${currentScreen === 'weather' ? 'active' : ''}`} style={currentScreen === 'weather' ? styles.screenActive : styles.screen}>
        <div style={styles.weatherScreen}>
          <div style={styles.tvFrame}>
            <div style={styles.tvScreen}>
              <div style={styles.clock}>{currentTime}</div>
              
              {weatherData && (
                <div style={styles.weatherContent}>
                  <div style={styles.weatherLocation}>
                    {`${weatherData.name}, ${weatherData.sys.country}`}
                  </div>
                  <div style={styles.weatherMain}>
                    {`${Math.round(weatherData.main.temp)}°C - ${weatherData.weather[0].main}`}
                  </div>
                  <div style={styles.weatherDescription}>
                    {`${weatherData.weather[0].description}`}
                    <br /><br />
                    {getWeatherAdvice(weatherData.weather[0].main)}
                  </div>
                  <div style={{ marginTop: '15px', color: '#8d6e63' }}>
                    <div>Feels like: {Math.round(weatherData.main.feels_like)}°C</div>
                    <div style={{ marginTop: '8px' }}>Humidity: {weatherData.main.humidity}%</div>
                    <div style={{ marginTop: '8px' }}>Wind: {weatherData.wind.speed} m/s</div>
                  </div>
                </div>
              )}
              
              <div style={styles.characterArea}>
                <img 
              src="./assets/hehe.gif" 
              alt="Kaoru Character"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = 'FORECASTING MODE: ON';
              }}
            />
              </div>
              
              <button 
                style={styles.detailsButton} 
                onClick={showDetailsPopup}
              >
                Details
              </button>
              <button 
                style={styles.backButton} 
                onClick={goBackHome}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* loading */}
      {loading && <div style={styles.loading}>Loading weather data...</div>}
      
      {/* error */}
      {errorMessage && (
        <div style={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      {/* popup */}
      {showPopup && weatherData && (
        <div style={styles.popupOverlay} onClick={closePopup}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton} 
              onClick={closePopup}
            >
              ×
            </button>
            <h3 style={{ color: '#d4691a', marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}>
              Detailed Weather Info
            </h3>
            <div style={styles.popupContent}>
              <div style={styles.detailRow}>
                <span>Temperature:</span>
                <span>{Math.round(weatherData.main.temp)}°C</span>
              </div>
              <div style={styles.detailRow}>
                <span>Feels Like:</span>
                <span>{Math.round(weatherData.main.feels_like)}°C</span>
              </div>
              <div style={styles.detailRow}>
                <span>Min Temperature:</span>
                <span>{Math.round(weatherData.main.temp_min)}°C</span>
              </div>
              <div style={styles.detailRow}>
                <span>Max Temperature:</span>
                <span>{Math.round(weatherData.main.temp_max)}°C</span>
              </div>
              <div style={styles.detailRow}>
                <span>Humidity:</span>
                <span>{weatherData.main.humidity}%</span>
              </div>
              <div style={styles.detailRow}>
                <span>Pressure:</span>
                <span>{weatherData.main.pressure} hPa</span>
              </div>
              <div style={styles.detailRow}>
                <span>Wind Speed:</span>
                <span>{weatherData.wind.speed} m/s</span>
              </div>
              <div style={styles.detailRow}>
                <span>Wind Direction:</span>
                <span>{weatherData.wind.deg}°</span>
              </div>
              <div style={styles.detailRow}>
                <span>Visibility:</span>
                <span>{(weatherData.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div style={styles.detailRow}>
                <span>Cloudiness:</span>
                <span>{weatherData.clouds.all}%</span>
              </div>
              <div style={styles.detailRow}>
                <span>Sunrise:</span>
                <span>{formatTimeFromTimestamp(weatherData.sys.sunrise)}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Sunset:</span>
                <span>{formatTimeFromTimestamp(weatherData.sys.sunset)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  appContainer: {
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    height: '100%',
    background: 'transparent',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    maxHeight: '100%'
  },
  screen: {
    width: '100%',
    height: '100%',
    position: 'relative',
    padding: '20px',
    display: 'none',
  },
  screenActive: {
    width: '100%',
    height: '100%',
    position: 'relative',
    padding: '20px',
    display: 'block',
  },
  homeScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
  },
  characterPlaceholder: {
    width: '85%',  
    height: '60%',
    maxWidth: '400px', 
    maxHeight: '240px', 
    background: 'linear-gradient(45deg, #d4a574, #e8c5a0)',
    border: '3px solid #a1887f',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5d4037',
    fontSize: '14px',
    fontWeight: '500',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  locationInputContainer: {
    position: 'absolute',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  locationInput: {
    width: '200px',
    height: '35px',
    border: '2px solid #a1887f',
    borderRadius: '6px',
    padding: '8px 12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    background: '#fff',
    color: '#5d4037',
    transition: 'all 0.2s ease',
  },
  searchButton: {
    width: '35px',
    height: '35px',
    borderRadius: '6px',
    border: '2px solid #a1887f',
    background: '#d4a574',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#f7f1e8',
    border: '2px solid #a1887f',
    borderTop: 'none',
    borderRadius: '0 0 6px 6px',
    maxHeight: '150px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  suggestionItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    borderBottom: '1px solid #d4a574',
    color: '#5d4037',
    fontWeight: '400',
    transition: 'background-color 0.15s ease',
  },
  weatherScreen: {
    padding: '15px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tvFrame: {
    width: '95%', 
    height: '85%', 
    maxWidth: '480px', 
    maxHeight: '360px',
    background: '#8d6e63',
    border: '8px solid #5d4037',
    borderRadius: '12px',
    position: 'relative',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 8px 20px rgba(0,0,0,0.4)',
  },
  tvScreen: {
    width: 'calc(100% - 10px)',
    height: 'calc(100% - 10px)',
    margin: '5px',
    background: 'linear-gradient(145deg, #d4a574, #e8c5a0)',
    borderRadius: '6px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
  },
  clock: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(93, 64, 55, 0.9)',
    border: '2px solid #a1887f',
    padding: '8px 12px',
    borderRadius: '4px',
    color: '#f7f1e8',
    fontSize: '11px',
    fontWeight: '500',
    fontFamily: "'Inter', monospace",
    minWidth: '80px',
    textAlign: 'center',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  weatherContent: {
    width: '50%',
    height: '100%',
    padding: '20px 15px',
    display: 'flex',
    flexDirection: 'column',
    color: '#5d4037',
    fontSize: '12px',
    lineHeight: 1.6,
    fontWeight: '400',
  },
  weatherLocation: {
    fontSize: '14px',
    color: '#5d4037',
    marginBottom: '15px',
    fontWeight: '600',
  },
  weatherMain: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#8d6e63',
    fontWeight: '600',
  },
  weatherDescription: {
    fontSize: '11px',
    color: '#5d4037',
    marginBottom: '15px',
    lineHeight: 1.5,
  },
  characterArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    height: '100%',
    background: 'linear-gradient(45deg, #e8c5a0, #d4a574)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5d4037',
    fontSize: '12px',
    borderLeft: '2px solid #a1887f',
  },
  detailsButton: {
    position: 'absolute',
    bottom: '15px',
    right: '80px',
    background: '#a1887f',
    color: 'white',
    border: '1px solid #8d6e63',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    background: '#d4a574',
    color: 'white',
    border: '1px solid #a1887f',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#d4a574',
    fontSize: '12px',
    fontWeight: '500',
    zIndex: 100,
  },
  errorMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(93, 64, 55, 0.9)',
    color: '#f7f1e8',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    zIndex: 1000,
    fontSize: '12px',
    maxWidth: '80%',
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    background: '#f7f1e8',
    border: '2px solid #a1887f',
    borderRadius: '8px',
    padding: '20px',
    width: '80%',
    maxHeight: '80%',
    overflowY: 'auto',
    color: '#5d4037',
    fontSize: '11px',
    lineHeight: 1.6,
    fontWeight: '400',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '12px',
    background: '#d4a574',
    color: 'white',
    border: '1px solid #a1887f',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupContent: {
    marginTop: '10px',
  },
  detailRow: {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px solid #d4a574',
  },
};

export default WeatherApp;