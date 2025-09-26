// AssetPreloader.js
export class AssetPreloader {
  constructor() {
    this.loadedAssets = new Map();
    this.loadingPromises = new Map();
  }

  // Preload images
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

  // Preload audio
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

  // Preload font
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
          this.loadedAssets.set(fontKey, font);
          this.loadingPromises.delete(fontKey);
          resolve(font);
        }).catch((error) => {
          this.loadingPromises.delete(fontKey);
          reject(new Error(`Failed to load font: ${fontFamily} from ${src}`));
        });
      } else {
        // Fallback for browsers without FontFace API
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: '${fontFamily}';
            src: url('${src}');
            ${descriptors.weight ? `font-weight: ${descriptors.weight};` : ''}
            ${descriptors.style ? `font-style: ${descriptors.style};` : ''}
          }
        `;
        document.head.appendChild(style);
        
        // Test if font loaded by measuring text width
        const testText = 'BESbswy';
        const testSize = '72px';
        const fallbackFont = 'monospace';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        context.font = `${testSize} ${fallbackFont}`;
        const fallbackWidth = context.measureText(testText).width;
        
        context.font = `${testSize} ${fontFamily}, ${fallbackFont}`;
        
        const checkFont = () => {
          const currentWidth = context.measureText(testText).width;
          if (currentWidth !== fallbackWidth) {
            this.loadedAssets.set(fontKey, true);
            this.loadingPromises.delete(fontKey);
            resolve(true);
          } else {
            setTimeout(checkFont, 50);
          }
        };
        
        // Start checking after a brief delay
        setTimeout(checkFont, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          this.loadingPromises.delete(fontKey);
          reject(new Error(`Font loading timeout: ${fontFamily}`));
        }, 5000);
      }
    });

    this.loadingPromises.set(fontKey, promise);
    return promise;
  }

  // Preload Google Fonts
  preloadGoogleFont(fontFamily, weights = ['400'], styles = ['normal']) {
    const fontKey = `google-${fontFamily}`;
    
    if (this.loadedAssets.has(fontKey)) {
      return Promise.resolve(this.loadedAssets.get(fontKey));
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    const promise = new Promise((resolve, reject) => {
      // Force load each weight and style combination
      const loadPromises = [];
      
      weights.forEach(weight => {
        styles.forEach(style => {
          if (document.fonts && document.fonts.load) {
            const fontString = `${weight} 16px '${fontFamily}'`;
            loadPromises.push(
              document.fonts.load(fontString).catch(() => {
                // Ignore individual font loading failures
                console.warn(`Failed to load ${fontString}`);
              })
            );
          }
        });
      });

      // Create test elements to force font rendering
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.visibility = 'hidden';
      testElement.style.fontFamily = `'${fontFamily}', serif`;
      testElement.textContent = 'Whispers of the Quill';
      testElement.id = `google-font-test-${fontFamily.replace(/\s+/g, '-')}`;
      
      document.body.appendChild(testElement);
      
      // Force layout calculation
      testElement.getBoundingClientRect();

      Promise.all(loadPromises).then(() => {
        this.loadedAssets.set(fontKey, true);
        this.loadingPromises.delete(fontKey);
        
        // Clean up test element after a moment
        setTimeout(() => {
          const el = document.getElementById(testElement.id);
          if (el) el.remove();
        }, 100);
        
        resolve(true);
      }).catch(() => {
        this.loadingPromises.delete(fontKey);
        // Clean up test element
        const el = document.getElementById(testElement.id);
        if (el) el.remove();
        reject(new Error(`Failed to load Google Font: ${fontFamily}`));
      });
    });

    this.loadingPromises.set(fontKey, promise);
    return promise;
  }

  // Wait for all fonts to be ready
  waitForFonts() {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready;
    }
    
    // Fallback: just wait a bit
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  // Preload multiple assets
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

// Create global instance
export const globalAssetPreloader = new AssetPreloader();

// Define your critical assets
export const CRITICAL_ASSETS = [
  // Fonts (load first for proper text rendering)
  { type: 'font', fontFamily: 'zozafont', src: './public/zozafont.ttf' },
  { type: 'font', fontFamily: 'Brick', src: './public/Brick.ttf' },
  
  // Google Fonts for NotebookApp (ADDED THIS)
  { type: 'google-font', fontFamily: 'Crimson Text', weights: ['400', '600'], styles: ['normal', 'italic'] },
  { type: 'google-font', fontFamily: 'Lora', weights: ['400', '500', '600'], styles: ['normal', 'italic'] },
  
  // Virtual Pet animations
  { type: 'image', src: './animations/walking_right.gif' },
  { type: 'image', src: './animations/walking_left.gif' },
  { type: 'image', src: './animations/click_right.gif' },
  { type: 'image', src: './animations/click-left.gif' },
  { type: 'image', src: './animations/drag.png' },
  
  // Character images
  { type: 'image', src: './assets/kaoru2.gif' },
  { type: 'image', src: './assets/kaoru.gif' },
  { type: 'image', src: './assets/hehe.gif' },
  { type: 'image', src: './assets/silly.jpg' },
  
  // Audio files
  { type: 'audio', src: './click.mp3' },
  { type: 'audio', src: './flip.mp3' },
  { type: 'audio', src: './keyboard.mp3' },
  
  // Desktop and app icons
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

// Music player assets (load separately as they're larger)
export const MUSIC_ASSETS = [
  { type: 'image', src: './albums/1.jpg' },
  { type: 'image', src: './albums/2.jpg' },
  { type: 'image', src: './albums/3.jfif' },
  { type: 'image', src: './albums/4.jpg' },
  { type: 'image', src: './albums/5.jpg' }
];

// Game assets (load when needed)
export const GAME_ASSETS = [
  { type: 'image', src: './hehe/basket.png' },
  { type: 'image', src: './hehe/leaf-1.png' },
  { type: 'image', src: './hehe/leaf-2.png' },
  { type: 'image', src: './hehe/leaf-3.png' },
  { type: 'audio', src: './hehe/catch2.mp3' },
  { type: 'audio', src: './hehe/home-music.mp3' },
  { type: 'audio', src: './hehe/game-music.mp3' }
];