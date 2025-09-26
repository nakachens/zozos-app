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
        'Loading fonts...',
        'Almost ready...',
        'please bare with me..',
        'oh im crying as im making this',
        'pure pain..'
      ];

      try {
        // Load assets with progress tracking
        let loadedCount = 0;
        const totalAssets = CRITICAL_ASSETS.length + 1; // +1 for font loading

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

        // Wait for fonts to load
        if (isMounted) {
          setCurrentAsset('fonts');
          setLoadingText('Loading fonts...');
          
          try {
            // Wait for document fonts to be ready
            if (document.fonts && document.fonts.ready) {
              await document.fonts.ready;
            } else {
              // Fallback: wait a bit for fonts to load
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Additional check for custom font
            const testElement = document.createElement('div');
            testElement.style.fontFamily = 'zozafont, monospace';
            testElement.style.fontSize = '12px';
            testElement.style.visibility = 'hidden';
            testElement.style.position = 'absolute';
            testElement.textContent = 'Test';
            document.body.appendChild(testElement);
            
            // Give a moment for font to apply
            await new Promise(resolve => setTimeout(resolve, 200));
            document.body.removeChild(testElement);
            
          } catch (error) {
            console.warn('Font loading check failed:', error);
          }
          
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
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
      <div className="text-center">
        {/* Loading status */}
        <div className="text-amber-100 text-xl mb-8 font-mono">
          {loadingText}
        </div>

        {/* Progress bar - matching the login screen style exactly */}
        <div className="w-96 h-6 bg-amber-900 border-2" style={{ 
          borderColor: '#d7ccc8 #3e2723 #3e2723 #d7ccc8',
          borderStyle: 'solid'
        }}>
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-300 animate-pulse" 
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>

        {/* Progress text */}
        <div className="text-amber-200 text-sm mt-6 font-mono">
          {Math.round(progress)}%{currentAsset && ` • ${currentAsset}`}
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;