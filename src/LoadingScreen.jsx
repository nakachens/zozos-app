import React, { useState, useEffect } from 'react';
import { globalAssetPreloader, CRITICAL_ASSETS } from './AssetPreloader';

function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing zozOS...');
  const [currentAsset, setCurrentAsset] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      const loadingTexts = [
        'Initializing zozOS...',
        'Loading desktop assets...',
        'Preparing virtual pet...',
        'Setting up applications...',
        'Almost ready...'
      ];

      try {
        // Load assets with progress tracking
        let loadedCount = 0;
        const totalAssets = CRITICAL_ASSETS.length;

        // Update loading text periodically
        const textInterval = setInterval(() => {
          if (isMounted) {
            const textIndex = Math.floor((loadedCount / totalAssets) * loadingTexts.length);
            setLoadingText(loadingTexts[Math.min(textIndex, loadingTexts.length - 1)]);
          }
        }, 800);

        // Load assets one by one for better progress tracking
        for (let i = 0; i < CRITICAL_ASSETS.length; i++) {
          if (!isMounted) break;

          const asset = CRITICAL_ASSETS[i];
          setCurrentAsset(asset.src.split('/').pop());

          try {
            if (asset.type === 'image') {
              await globalAssetPreloader.preloadImage(asset.src);
            } else if (asset.type === 'audio') {
              await globalAssetPreloader.preloadAudio(asset.src);
            }
          } catch (error) {
            console.warn(`Failed to load ${asset.src}:`, error);
          }

          loadedCount++;
          if (isMounted) {
            setProgress((loadedCount / totalAssets) * 100);
          }
        }

        clearInterval(textInterval);

        // Show completion message
        if (isMounted) {
          setLoadingText('Welcome to zozOS!');
          setCurrentAsset('');
          
          // Brief pause before transitioning
          setTimeout(() => {
            if (isMounted && onLoadingComplete) {
              onLoadingComplete();
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Loading failed:', error);
        if (isMounted && onLoadingComplete) {
          onLoadingComplete(); // Continue anyway
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [onLoadingComplete]);

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #492000ff 0%, #4b2310ff 100%)',
        fontFamily: 'monospace'
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              background: ['#ff8c42', '#ff6b35', '#ffa500', '#daa520'][Math.floor(Math.random() * 4)],
              opacity: 0.6 + Math.random() * 0.4
            }}
          />
        ))}
      </div>
      
      <div className="text-center relative z-10 max-w-md px-6">
        {/* Logo */}
        <div className="text-6xl font-bold mb-8"
             style={{
               fontFamily: 'zozafont, monospace', 
               color: "wheat",
               textShadow: `
                 2px 2px 0px #783e00ff,
                 4px 4px 0px #783e00ff,
                 6px 6px 0px #783e00ff
               `,
               letterSpacing: '0.1em'
             }}>
          zozOS
        </div>

        {/* Loading text */}
        <div className="text-xl font-bold mb-6"
             style={{
               color: '#d2bfb0ff',
               textShadow: '2px 2px 0px #a0522d',
               letterSpacing: '0.1em'
             }}>
          {loadingText}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-amber-900 rounded-full h-6 mb-4 border-2"
             style={{ 
               borderColor: '#d7ccc8 #3e2723 #3e2723 #d7ccc8',
               borderStyle: 'solid'
             }}>
          <div 
            className="bg-gradient-to-r from-orange-400 to-amber-300 h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${Math.max(progress, 5)}%`,
              animation: progress > 0 ? 'none' : 'pulse 2s infinite'
            }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-lg font-bold mb-4"
             style={{
               color: '#d2c4baff',
               fontFamily: 'monospace'
             }}>
          {Math.round(progress)}%
        </div>

        {/* Current asset */}
        {currentAsset && (
          <div className="text-sm opacity-70"
               style={{ 
                 color: '#9c9c9cff',
                 fontFamily: 'monospace'
               }}>
            Loading: {currentAsset}
          </div>
        )}

        {/* Loading tip */}
        <div className="mt-8 text-xs opacity-60 italic"
             style={{ 
               color: '#9c9c9cff',
               fontFamily: 'monospace',
               maxWidth: '300px',
               lineHeight: '1.4'
             }}>
          Tip: Right-click the pet to move it behind or in front of windows!
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;