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
        background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
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
              background: ['#d7ccc8', '#bcaaa4', '#a1887f', '#8d6e63'][Math.floor(Math.random() * 4)],
              opacity: 0.4 + Math.random() * 0.6
            }}
          />
        ))}
      </div>

      <div className="text-center">
        {/* Loading status */}
        <div className="text-amber-100 text-xl mb-8 font-mono">
          {loadingText}
        </div>

        {/* Progress bar */}
        <div className="w-96 h-6 bg-amber-900 border-2 mb-6" 
             style={{ 
               borderColor: '#d7ccc8 #3e2723 #3e2723 #d7ccc8',
               borderStyle: 'solid'
             }}>
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-300 transition-all duration-300 ease-out" 
            style={{ 
              width: `${Math.max(progress, 2)}%`,
              animation: progress > 0 ? 'none' : 'pulse 2s infinite'
            }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-amber-200 text-lg mb-4 font-mono">
          {Math.round(progress)}%
        </div>

        {/* Current asset */}
        {currentAsset && (
          <div className="text-amber-200 text-sm mb-6 font-mono opacity-80">
            Loading: {currentAsset}
          </div>
        )}

        {/* Loading tip */}
        <div className="text-amber-200 text-sm mt-8 font-mono">
          Please wait...
        </div>

        {/* Tip section */}
        <div className="mt-12 text-xs opacity-60 italic text-amber-300 font-mono max-w-md mx-auto leading-relaxed">
          Tip: Right-click the pet to move it behind or in front of windows!
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;