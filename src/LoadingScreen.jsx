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
        'Preloading notebook fonts...',
        'Almost ready...',
        'please bare with me..',
        'oh im crying as im making this',
        'pure pain..'
      ];

      try {
        // Load assets with progress tracking
        let loadedCount = 0;
        const totalAssets = CRITICAL_ASSETS.length + 2; // +2 for font loading phases

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
          setCurrentAsset(asset.src ? asset.src.split('/').pop() : asset.fontFamily);

          try {
            if (asset.type === 'image') {
              await globalAssetPreloader.preloadImage(asset.src);
            } else if (asset.type === 'audio') {
              await globalAssetPreloader.preloadAudio(asset.src);
            } else if (asset.type === 'google-font') {
              await globalAssetPreloader.preloadGoogleFont(asset.fontFamily, asset.weights, asset.styles);
            } else if (asset.type === 'font') {
              await globalAssetPreloader.preloadFont(asset.fontFamily, asset.src, asset.descriptors);
            }
          } catch (error) {
            console.warn(`Failed to load ${asset.src || asset.fontFamily}:`, error);
          }

          loadedCount++;
          if (isMounted) {
            setProgress((loadedCount / totalAssets) * 100);
          }
        }

        // Special focus on Dancing Script font loading
        if (isMounted) {
          setCurrentAsset('Dancing Script font');
          setLoadingText('Loading Dancing Script font...');
          
          // Create test elements to force Dancing Script to load properly
          const testTexts = [
            'Whispers of the Quill',
            'Mysterious dude', 
            'Dear diary magical entry',
            'My Collected Thoughts'
          ];
          
          testTexts.forEach((text, index) => {
            const testEl = document.createElement('div');
            testEl.style.position = 'fixed';
            testEl.style.left = '-9999px';
            testEl.style.top = '-9999px';
            testEl.style.visibility = 'hidden';
            testEl.style.fontFamily = '"Dancing Script", cursive';
            testEl.style.fontSize = '16px';
            testEl.textContent = text;
            
            document.body.appendChild(testEl);
            
            // Force reflow
            testEl.offsetHeight;
            testEl.getBoundingClientRect();
            
            setTimeout(() => {
              if (testEl.parentNode) {
                testEl.parentNode.removeChild(testEl);
              }
            }, 100 + (index * 50));
          });
          
          // Wait for Dancing Script to be properly loaded
          await new Promise(resolve => setTimeout(resolve, 500));
          
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
        }

        // Wait for all fonts to be ready
        if (isMounted) {
          setCurrentAsset('system fonts');
          setLoadingText('Finalizing font loading...');
          
          try {
            // Wait for document fonts to be ready
            if (document.fonts && document.fonts.ready) {
              await document.fonts.ready;
            }
            
            // Additional verification that Dancing Script is loaded
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Test Dancing Script loading
            ctx.font = '20px cursive';
            const fallbackWidth = ctx.measureText('Mysterious dude').width;
            
            ctx.font = '20px "Dancing Script", cursive';
            const dancingWidth = ctx.measureText('Mysterious dude').width;
            
            // If they're the same, Dancing Script might not be loaded yet
            if (Math.abs(dancingWidth - fallbackWidth) < 1) {
              console.warn('Dancing Script may not be fully loaded, waiting...');
              await new Promise(resolve => setTimeout(resolve, 800));
            }
            
            // Additional wait for all fonts to settle
            await new Promise(resolve => setTimeout(resolve, 300));
            
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