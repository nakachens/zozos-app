/* eslint-disable no-unused-vars */
export class AssetPreloader {
  constructor() {
    this.loadedAssets = new Map();
    this.loadingPromises = new Map();
  }

  // preloading images
  preloadImage(src) {
    if (this.loadedAssets.has(src)) {
      return Promise.resolve(this.loadedAssets.get(src));
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedAssets.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // preloading audio
  preloadAudio(src) {
    if (this.loadedAssets.has(src)) {
      return Promise.resolve(this.loadedAssets.get(src));
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.loadedAssets.set(src, audio);
        this.loadingPromises.delete(src);
        resolve(audio);
      };
      audio.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load audio: ${src}`));
      };
      audio.preload = 'auto';
      audio.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // preloading zozafont
  preloadFont(fontFamily, src, descriptors = {}) {
    const fontKey = `${fontFamily}-${src}`;
    
    if (this.loadedAssets.has(fontKey)) {
      return Promise.resolve(this.loadedAssets.get(fontKey));
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    const promise = new Promise((resolve, reject) => {
      if ('FontFace' in window) {
        const font = new FontFace(fontFamily, `url(${src})`, descriptors);
        font.load().then(() => {
          document.fonts.add(font);
          
          if (fontFamily === 'zozafont') {
            const testTexts = ['zozOS', 'TIME TO LOG IN?', 'AUTUMN OS'];
            
            testTexts.forEach((text, index) => {
              const testEl = document.createElement('div');
              testEl.style.position = 'fixed';
              testEl.style.left = '-9999px';
              testEl.style.top = '-9999px';
              testEl.style.visibility = 'hidden';
              testEl.style.fontFamily = `"${fontFamily}", monospace`;
              testEl.style.fontSize = '64px';
              testEl.style.fontWeight = 'bold';
              testEl.textContent = text;
              
              document.body.appendChild(testEl);
              
              testEl.offsetHeight;
              testEl.getBoundingClientRect();
              testEl.scrollWidth;
              
              setTimeout(() => {
                if (testEl.parentNode) {
                  testEl.parentNode.removeChild(testEl);
                }
              }, 200 + (index * 50));
            });
          }
          
          this.loadedAssets.set(fontKey, font);
          this.loadingPromises.delete(fontKey);
          resolve(font);
        }).catch((error) => {
          this.loadingPromises.delete(fontKey);
          reject(new Error(`Failed to load font: ${fontFamily} from ${src}`));
        });
      } else {
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: '${fontFamily}';
            src: url('${src}');
            font-display: block;
            ${descriptors.weight ? `font-weight: ${descriptors.weight};` : ''}
            ${descriptors.style ? `font-style: ${descriptors.style};` : ''}
          }
        `;
        document.head.appendChild(style);
        
        const testText = fontFamily === 'zozafont' ? 'zozOS' : 'BESbswy';
        const testSize = '64px';
        const fallbackFont = 'monospace';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        context.font = `${testSize} ${fallbackFont}`;
        const fallbackWidth = context.measureText(testText).width;
        
        context.font = `${testSize} "${fontFamily}", ${fallbackFont}`;
        
        let attempts = 0;
        const maxAttempts = 100; 
        
        const checkFont = () => {
          attempts++;
          const currentWidth = context.measureText(testText).width;
          
          if (Math.abs(currentWidth - fallbackWidth) > 2 || attempts >= maxAttempts) {
            this.loadedAssets.set(fontKey, true);
            this.loadingPromises.delete(fontKey);
            resolve(true);
          } else {
            setTimeout(checkFont, 50);
          }
        };
        
        setTimeout(checkFont, 100);
      }
    });

    this.loadingPromises.set(fontKey, promise);
    return promise;
  }

  preloadGoogleFont(fontFamily, weights = ['400'], styles = ['normal']) {
    const fontKey = `google-${fontFamily}`;
    
    if (this.loadedAssets.has(fontKey)) {
      return Promise.resolve(this.loadedAssets.get(fontKey));
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    const promise = new Promise((resolve, reject) => {
      if (!document.fonts) {
        setTimeout(() => resolve(true), 1000);
        return;
      }

      const loadPromises = [];
      
      weights.forEach(weight => {
        styles.forEach(style => {
          const fontString = `${style === 'italic' ? 'italic ' : ''}${weight} 16px "${fontFamily}"`;
          loadPromises.push(
            document.fonts.load(fontString).then(() => {
              const testTexts = [
                'Whispers of the Quill',
                'Mysterious dude', 
                'Dear diary magical entry',
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
              ];
              
              testTexts.forEach((text, index) => {
                const testEl = document.createElement('div');
                testEl.style.position = 'fixed';
                testEl.style.left = '-9999px';
                testEl.style.top = '-9999px';
                testEl.style.visibility = 'hidden';
                testEl.style.fontFamily = `"${fontFamily}", cursive`;
                testEl.style.fontWeight = weight;
                testEl.style.fontStyle = style;
                testEl.style.fontSize = '16px';
                testEl.textContent = text;
                
                document.body.appendChild(testEl);
                
                testEl.offsetHeight;
                testEl.getBoundingClientRect();
                testEl.scrollWidth;
                
                setTimeout(() => {
                  if (testEl.parentNode) {
                    testEl.parentNode.removeChild(testEl);
                  }
                }, 100 + (index * 20));
              });
              
              return true;
            }).catch((error) => {
              console.warn(`Failed to load ${fontString}:`, error);
              return false;
            })
          );
        });
      });

      Promise.all(loadPromises).then(() => {
        if (fontFamily === 'Dancing Script') {
          const finalTest = document.createElement('canvas');
          const ctx = finalTest.getContext('2d');
          
          ctx.font = '20px cursive';
          const fallbackWidth = ctx.measureText('Mysterious dude').width;
          
          ctx.font = '20px "Dancing Script", cursive';
          const dancingWidth = ctx.measureText('Mysterious dude').width;
          
          if (Math.abs(dancingWidth - fallbackWidth) > 1) {
            this.loadedAssets.set(fontKey, true);
            this.loadingPromises.delete(fontKey);
            resolve(true);
          } else {
            setTimeout(() => {
              this.loadedAssets.set(fontKey, true);
              this.loadingPromises.delete(fontKey);
              resolve(true);
            }, 200);
          }
        } else {
          this.loadedAssets.set(fontKey, true);
          this.loadingPromises.delete(fontKey);
          resolve(true);
        }
      }).catch((error) => {
        this.loadingPromises.delete(fontKey);
        console.warn(`Font loading failed for ${fontFamily}:`, error);
        resolve(true); 
      });
    });

    this.loadingPromises.set(fontKey, promise);
    return promise;
  }

  waitForFonts() {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready;
    }
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // preloading multiple assets
  async preloadAssets(assets) {
    const promises = assets.map(asset => {
      if (asset.type === 'image') {
        return this.preloadImage(asset.src);
      } else if (asset.type === 'audio') {
        return this.preloadAudio(asset.src);
      } else if (asset.type === 'font') {
        return this.preloadFont(asset.fontFamily, asset.src, asset.descriptors);
      } else if (asset.type === 'google-font') {
        return this.preloadGoogleFont(asset.fontFamily, asset.weights, asset.styles);
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.warn('Some assets failed to preload:', error);
      return false;
    }
  }
}

// global instance
export const globalAssetPreloader = new AssetPreloader();

export const CRITICAL_ASSETS = [
  { type: 'font', fontFamily: 'zozafont', src: './public/zozafont.ttf' },
  { type: 'font', fontFamily: 'Brick', src: './public/Brick.ttf' },
  
  { type: 'google-font', fontFamily: 'Dancing Script', weights: ['400', '500', '600', '700'], styles: ['normal'] },
  { type: 'google-font', fontFamily: 'Crimson Text', weights: ['400', '600'], styles: ['normal', 'italic'] },
  { type: 'google-font', fontFamily: 'Cinzel', weights: ['400', '500', '600'], styles: ['normal'] },
  
  { type: 'image', src: './animations/walking_right.gif' },
  { type: 'image', src: './animations/walking_left.gif' },
  { type: 'image', src: './animations/click_right.gif' },
  { type: 'image', src: './animations/click-left.gif' },
  { type: 'image', src: './animations/drag.png' },
  
  { type: 'image', src: './assets/kaoru2.gif' },
  { type: 'image', src: './assets/kaoru.gif' },
  { type: 'image', src: './assets/hehe.gif' },
  { type: 'image', src: './assets/silly.jpg' },
  
  { type: 'audio', src: './click.mp3' },
  { type: 'audio', src: './flip.mp3' },
  { type: 'audio', src: './keyboard.mp3' },
  
  { type: 'image', src: './assets/desktop12.jpg' },
  { type: 'image', src: './assets/calculator.png' },
  { type: 'image', src: './assets/music.png' },
  { type: 'image', src: './assets/weather.png' },
  { type: 'image', src: './assets/tictactoe.png' },
  { type: 'image', src: './assets/notebook.png' },
  { type: 'image', src: './assets/leaves.png' },
  { type: 'image', src: './assets/search.png' },
  { type: 'image', src: './assets/poetry.png' },
  { type: 'image', src: './assets/memory.png' },
  { type: 'image', src: './assets/snakey.png' },
  { type: 'image', src: './assets/paint.png' },
  { type: 'image', src: './assets/folder.png' },
  { type: 'image', src: './assets/img.png' },
  { type: 'image', src: './assets/txt.png' }
];

export const MUSIC_ASSETS = [
  { type: 'image', src: './albums/1.jpg' },
  { type: 'image', src: './albums/2.jpg' },
  { type: 'image', src: './albums/3.jfif' },
  { type: 'image', src: './albums/4.jpg' },
  { type: 'image', src: './albums/5.jpg' }
];

export const GAME_ASSETS = [
  { type: 'image', src: './hehe/basket.png' },
  { type: 'image', src: './hehe/leaf-1.png' },
  { type: 'image', src: './hehe/leaf-2.png' },
  { type: 'image', src: './hehe/leaf-3.png' },
  { type: 'audio', src: './hehe/catch2.mp3' },
  { type: 'audio', src: './hehe/home-music.mp3' },
  { type: 'audio', src: './hehe/game-music.mp3' }
];