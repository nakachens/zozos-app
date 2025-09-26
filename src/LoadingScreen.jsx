import React, { useState, useEffect } from 'react';
import { globalAssetPreloader, CRITICAL_ASSETS } from './AssetPreloader';

function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('AUTUMN OS LOADING...');
  const [currentAsset, setCurrentAsset] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      const loadingTexts = [
        'AUTUMN OS LOADING...',
        'Loading desktop assets...',
        'Preparing applications...',
        'Almost ready...',
        'please bare with me..',
        'oh im crying as im making this',
        'pure pain..'
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
      <div className="text-center w-full max-w-md mx-auto px-6">
        {/* Loading status */}
        <div className="text-amber-100 text-xl mb-12 font-mono tracking-wide">
          {loadingText}
        </div>

        {/* Progress bar */}
        <div className="w-full h-6 bg-amber-900 border-2 mb-8 mx-auto" 
             style={{ 
               borderColor: '#d7ccc8 #3e2723 #3e2723 #d7ccc8',
               borderStyle: 'solid',
               maxWidth: '320px'
             }}>
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-300 transition-all duration-300 ease-out" 
            style={{ 
              width: `${Math.max(progress, 2)}%`,
              animation: progress > 0 ? 'none' : 'pulse 2s infinite'
            }}
          />
        </div>

        {/* Progress percentage and current asset in one line */}
        <div className="text-amber-200 text-sm font-mono">
          {Math.round(progress)}% {currentAsset && `• ${currentAsset}`}
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;