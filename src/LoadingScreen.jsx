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
        'oh im crying as im making this',
        'Loading zozafont...',
        'Almost ready...',
        'please bare with me..',
        'pure pain..'
      ];

      try {
        // asset loading
        let loadedCount = 0;
        const totalAssets = CRITICAL_ASSETS.length + 3; // +3 for additional font loading phases

        // loading text while loading
        const textInterval = setInterval(() => {
          if (isMounted) {
            const textIndex = Math.floor((loadedCount / totalAssets) * loadingTexts.length);
            setLoadingText(loadingTexts[Math.min(textIndex, loadingTexts.length - 1)]);
          }
        }, 800);

        
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

        // my font loading
        if (isMounted) {
          setCurrentAsset('zozafont');
          setLoadingText('Loading zozafont...');
          
          // testing
          const zozoTestEl = document.createElement('div');
          zozoTestEl.style.position = 'fixed';
          zozoTestEl.style.left = '-9999px';
          zozoTestEl.style.top = '-9999px';
          zozoTestEl.style.visibility = 'hidden';
          zozoTestEl.style.fontFamily = 'zozafont, monospace';
          zozoTestEl.style.fontSize = '64px';
          zozoTestEl.style.fontWeight = 'bold';
          zozoTestEl.textContent = 'zozOS';
          
          document.body.appendChild(zozoTestEl);
          
          // forcing
          zozoTestEl.offsetHeight;
          zozoTestEl.getBoundingClientRect();
      
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          ctx.font = '64px monospace';
          const fallbackWidth = ctx.measureText('zozOS').width;
          
          ctx.font = '64px zozafont, monospace';
          const zozoWidth = ctx.measureText('zozOS').width;
          
          if (Math.abs(zozoWidth - fallbackWidth) < 5) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
          
          // remove testing
          setTimeout(() => {
            if (zozoTestEl.parentNode) {
              zozoTestEl.parentNode.removeChild(zozoTestEl);
            }
          }, 200);
          
          // load properly MAN
          await new Promise(resolve => setTimeout(resolve, 300));
          
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
        }

        if (isMounted) {
          setCurrentAsset('Dancing Script font');
          setLoadingText('Loading Dancing Script font...');
          
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
            
            testEl.offsetHeight;
            testEl.getBoundingClientRect();
            
            setTimeout(() => {
              if (testEl.parentNode) {
                testEl.parentNode.removeChild(testEl);
              }
            }, 100 + (index * 50));
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
        }

        if (isMounted) {
          setCurrentAsset('system fonts');
          setLoadingText('Finalizing font loading...');
          
          try {
            if (document.fonts && document.fonts.ready) {
              await document.fonts.ready;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.font = '64px monospace';
            const monoWidth = ctx.measureText('zozOS').width;
            
            ctx.font = '64px zozafont, monospace';
            const zozoWidth = ctx.measureText('zozOS').width;
            
            ctx.font = '20px cursive';
            const cursiveWidth = ctx.measureText('Mysterious dude').width;
            
            ctx.font = '20px "Dancing Script", cursive';
            const dancingWidth = ctx.measureText('Mysterious dude').width;
            
            if (Math.abs(zozoWidth - monoWidth) < 2 || Math.abs(dancingWidth - cursiveWidth) < 1) {
              console.warn('Key fonts may not be fully loaded, waiting...');
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          
            await new Promise(resolve => setTimeout(resolve, 400));
            
          } catch (error) {
            console.warn('Font loading check failed:', error);
          }
          
          loadedCount++;
          setProgress((loadedCount / totalAssets) * 100);
        }

        clearInterval(textInterval);

        if (isMounted) {
          setLoadingText('Welcome to zozOS!');
          setCurrentAsset('');
          
          setTimeout(() => {
            if (isMounted && onLoadingComplete) {
              onLoadingComplete();
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Loading failed:', error);
        if (isMounted && onLoadingComplete) {
          onLoadingComplete(); 
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
        {/* status */}
        <div className="text-amber-100 text-xl mb-8 font-mono">
          {loadingText}
        </div>

        {/* progress bar */}
        <div className="w-96 h-6 bg-amber-900 border-2" style={{ 
          borderColor: '#d7ccc8 #3e2723 #3e2723 #d7ccc8',
          borderStyle: 'solid'
        }}>
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-300 animate-pulse" 
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>

        {/*  text */}
        <div className="text-amber-200 text-sm mt-6 font-mono">
          {Math.round(progress)}%{currentAsset && ` • ${currentAsset}`}
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;