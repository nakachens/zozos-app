import React, { useState } from 'react';

// WiFi Sidebar Component
function WiFiSidebar({ isOpen, onClose, onZozoClick }) {
  const [brightness, setBrightness] = useState(75);
  const [volume, setVolume] = useState(60);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [nightLight, setNightLight] = useState(false);
  const [accessibility, setAccessibility] = useState(false);

  const playClickSound = () => {
    const audio = new Audio('/click.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const toggleSetting = (setter, current) => {
    playClickSound();
    setter(!current);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div 
        className="fixed bottom-12 right-4 w-80 border-4 shadow-2xl z-40 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #f5deb3, #deb887)',
          borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
          borderStyle: 'solid',
          fontFamily: 'monospace',
          borderRadius: '8px'
        }}
      >
        {/* header */}
        <div 
          className="px-4 py-3 border-b-2 flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, #daa520 0%, #b8860b 50%, #cd853f 100%)',
            borderColor: '#8b4513',
            color: '#f5deb3'
          }}
        >
          <span className="text-sm font-bold">Quick Settings</span>
          <button 
            className="w-5 h-5 border-2 text-xs flex items-center justify-center font-bold hover:opacity-80 transition-opacity"
            onClick={onClose}
            style={{ 
              borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
              background: '#f5deb3',
              color: '#8b4513'
            }}
          >
            ×
          </button>
        </div>

        {/* settings */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'WiFi', icon: '📶', enabled: wifiEnabled, setter: setWifiEnabled },
              { label: 'Bluetooth', icon: '🔗', enabled: bluetoothEnabled, setter: setBluetoothEnabled },
              { label: 'Airplane', icon: '✈️', enabled: airplaneMode, setter: setAirplaneMode },
              { label: 'Battery', icon: '🔋', enabled: batterySaver, setter: setBatterySaver },
              { label: 'Night', icon: '🌙', enabled: nightLight, setter: setNightLight },
              { label: 'Access', icon: '♿', enabled: accessibility, setter: setAccessibility }
            ].map((setting, index) => (
              <button
                key={index}
                className="p-3 border-2 rounded transition-all duration-200 flex items-center justify-center space-x-2 hover:transform hover:scale-105"
                onClick={() => toggleSetting(setting.setter, setting.enabled)}
                style={{
                  background: setting.enabled 
                    ? 'linear-gradient(145deg, #daa520, #b8860b)' 
                    : 'linear-gradient(145deg, #f5deb3, #deb887)',
                  borderColor: setting.enabled 
                    ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
                    : '#f5deb3 #8b4513 #8b4513 #f5deb3',
                  color: setting.enabled ? '#f5deb3' : '#8b4513',
                  minHeight: '50px',
                  width: 'auto'
                }}
              >
                <span className="text-sm">{setting.icon}</span>
                <span className="text-xs font-bold">{setting.label}</span>
              </button>
            ))}
          </div>

          {/* zozo special*/}
          <div className="px-2">
            <button
              className="w-full p-3 border-2 rounded transition-all duration-200 flex items-center justify-center space-x-2 hover:transform hover:scale-105"
              onClick={() => {
                playClickSound();
                onZozoClick();
                onClose();
              }}
              style={{
                background: 'linear-gradient(145deg, #ff6b35, #ff8c42)',
                borderColor: '#8b4513 #f5deb3 #f5deb3 #8b4513',
                color: '#fff',
                marginTop: '8px',
                marginBottom: '8px'
              }}
            >
              <span className="text-sm">🍂</span>
              <span className="text-xs font-bold">ZOZO SPECIAL</span>
            </button>
          </div>

          {/* sliders*/}
          <div className="space-y-4 pt-3 border-t-2 px-2" style={{ borderColor: '#8b4513' }}>
            <div className="px-2 py-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">☀️</span>
                  <span className="text-xs font-bold text-amber-900">Brightness</span>
                </div>
                <span className="text-xs text-amber-700 font-bold">{brightness}%</span>
              </div>
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                  className="w-full h-2 rounded appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #8b4513, #daa520)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <div className="px-2 py-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🔊</span>
                  <span className="text-xs font-bold text-amber-900">Volume</span>
                </div>
                <span className="text-xs text-amber-700 font-bold">{volume}%</span>
              </div>
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full h-2 rounded appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #8b4513, #daa520)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WiFiSidebar;