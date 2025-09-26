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
        'Almost ready...',
        'please bare with me...',
        'i cried making this btw lol',
        'im crying as im writing this btw lol'
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
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
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
              opacity: 0.4 + Math.random() * 0.6
            }}
          />
        ))}
      </div>
      
      <div className="text-center relative z-10 max-w-lg">
        {/* Main logo */}
        <div className="mb-12"
             style={{
               fontFamily: 'zozafont, monospace', 
               fontSize: '4rem',
               fontWeight: 'bold',
               color: "wheat",
               textShadow: `
                 2px 2px 0px #783e00ff,
                 4px 4px 0px #783e00ff,
                 6px 6px 0px #783e00ff,
                 8px 8px 0px #783e00ff,
                 10px 10px 20px #783e00ff
               `,
               letterSpacing: '0.1em',
               lineHeight: '1'
             }}>
          zozOS
        </div>

        {/* System info */}
        <div className="mb-16 border-4 p-6"
             style={{
               background: 'linear-gradient(145deg, #d7ccc8, #bcaaa4)',
               borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
               borderStyle: 'solid',
               fontFamily: 'Courier New, monospace'
             }}>
          <div className="text-center mb-4">
            <div className="font-bold text-lg mb-2" style={{ color: '#3e2723' }}>
              SYSTEM LOADING
            </div>
            <div className="text-sm" style={{ color: '#5d4037' }}>
              AUTUMN OS v2.1 - SEPTEMBER EDITION
            </div>
          </div>

          {/* Loading status */}
          <div className="mb-6">
            <div className="text-base font-bold mb-3"
                 style={{
                   color: '#3e2723',
                   letterSpacing: '0.05em'
                 }}>
              {loadingText}
            </div>

            {/* Progress bar */}
            <div className="w-full h-6 border-2 mb-3"
                 style={{ 
                   background: '#efebe9',
                   borderColor: '#3e2723 #efebe9 #efebe9 #3e2723',
                   borderStyle: 'solid'
                 }}>
              <div 
                className="h-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${Math.max(progress, 2)}%`,
                  background: 'linear-gradient(90deg, #8d6e63 0%, #6d4c41 50%, #5d4037 100%)',
                  animation: progress > 0 ? 'none' : 'pulse 2s infinite'
                }}
              />
            </div>

            {/* Progress info */}
            <div className="flex justify-between text-sm"
                 style={{ color: '#5d4037' }}>
              <span>PROGRESS: {Math.round(progress)}%</span>
              <span>PLEASE WAIT...</span>
            </div>
          </div>

          {/* Current asset info */}
          {currentAsset && (
            <div className="border-t-2 pt-4"
                 style={{ borderColor: '#6d4c41' }}>
              <div className="text-xs"
                   style={{ 
                     color: '#6d4c41',
                     fontFamily: 'monospace'
                   }}>
                LOADING: {currentAsset}
              </div>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="space-y-4 text-center">
          {/* System tip */}
          <div className="border-2 p-4"
               style={{
                 background: 'linear-gradient(145deg, #efebe9, #d7ccc8)',
                 borderColor: '#3e2723 #efebe9 #efebe9 #3e2723',
                 borderStyle: 'solid'
               }}>
            <div className="text-xs font-bold mb-2" style={{ color: '#3e2723' }}>
              SYSTEM TIP:
            </div>
            <div className="text-xs leading-relaxed"
                 style={{ 
                   color: '#5d4037',
                   fontFamily: 'monospace'
                 }}>
              Right-click the pet to move it behind or in front of windows!
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs opacity-70"
               style={{ 
                 color: '#9c9c9cff',
                 fontFamily: 'monospace',
                 letterSpacing: '0.1em'
               }}>
            © 2025 ZOZA SYSTEMS
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;