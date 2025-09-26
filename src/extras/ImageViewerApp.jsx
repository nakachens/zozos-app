/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

function ImageViewerApp({ imageName = "img-1.jpg", onClose, onTitleChange }) {
  const images = [
    { name: "progress-record-1", url: "./images/img-1.png" },
    { name: "tictactoe-issue", url: "./images/img-2.png" },
    { name: "my-friend-smiley", url: "./images/img-3.jpg" },
    { name: "tictactoe-ugly-layout", url: "./images/img-4.png" },
    { name: "me-planning-for-this-project", url: "./images/img-5.jpg" },
    { name: "old-ugly-taskbar", url: "./images/img-6.png" },
    { name: "cute-klein", url: "./images/img-7.jpg" },
    { name: "cute-klein-2", url: "./images/img-8.jpg" },
    { name: "rei", url: "./images/img-9.jpg" },
    { name: "bro-scared-himself", url: "./images/img-10.jpg" },
    { name: "i-hate-kaoru", url: "./images/img-11.jpg" },
    { name: "kaoru", url: "./images/img-12.jpg" },
    { name: "face-reveal", url: "./images/img-13.jpg" },
    { name: "me-when-this-project", url: "./images/img-14.jpg" },
    { name: "me-when-this-project-2", url: "./images/img-15.jpg" },
    { name: "tehee", url: "./images/img-16.jpg" },
    { name: "me-when-i", url: "./images/img-17.jpg" },
    { name: "cute-akechi", url: "./images/img-18.jpg" },
    { name: "nom-nom", url: "./images/img-19.jpg" },
    { name: "when-i-went-out-in-months", url: "./images/img-20.jpeg" },
    { name: "me-tryna-explain-this-project", url: "./images/img-21.jpg" },
  ];

  const getInitialIndex = () => {
    const index = images.findIndex(img => img.name === imageName);
    return index !== -1 ? index : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex());
  const [imageError, setImageError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentImage = images[currentIndex];
    if (currentImage && onTitleChange) {
      onTitleChange(currentImage.name);
    }
  }, [currentIndex, onTitleChange, images]);

  const playClickSound = () => {
    const audio = new Audio('/click.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const nextImage = () => {
    playClickSound();
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setImageError(false);
    setZoomLevel(1);
    setIsLoading(true);
  };

  const prevImage = () => {
    playClickSound();
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setImageError(false);
    setZoomLevel(1);
    setIsLoading(true);
  };

  const handleZoomIn = () => {
    playClickSound();
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    playClickSound();
    setZoomLevel(prev => Math.max(prev - 0.2, 0.2));
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // get current image 
  const currentImage = images[currentIndex] || images[0];

  return (
    <div 
      style={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #2c1810, #1a0f0a)',
        fontFamily: 'Courier New, monospace',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      
      {/* img header*/}
      <div 
        style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'linear-gradient(90deg, #b8860b 0%, #cd853f 50%, #daa520 100%)',
          color: '#fff8dc',
          borderBottom: '2px solid #8b4513',
          flexShrink: 0,
          height: '44px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '16px' }}>🖼️</span>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '13px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            {currentImage.name}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button 
            style={{
              padding: '4px 8px',
              background: 'linear-gradient(145deg, #deb887, #cd853f)',
              border: '2px solid',
              borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
              borderRadius: '2px',
              color: '#8b4513',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '32px',
              height: '24px',
              fontFamily: 'inherit'
            }}
            onClick={handleZoomOut}
            onMouseDown={(e) => e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513'}
            onMouseUp={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
            onMouseLeave={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
          >
            🔍-
          </button>
          <button 
            style={{
              padding: '4px 8px',
              background: 'linear-gradient(145deg, #deb887, #cd853f)',
              border: '2px solid',
              borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
              borderRadius: '2px',
              color: '#8b4513',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '32px',
              height: '24px',
              fontFamily: 'inherit'
            }}
            onClick={handleZoomIn}
            onMouseDown={(e) => e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513'}
            onMouseUp={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
            onMouseLeave={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
          >
            🔍+
          </button>
        </div>
      </div>

      {/* display area*/}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #1a0f0a 0%, #0f0704 100%)'
      }}>
        
        {/* navi*/}
        <button 
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            background: 'linear-gradient(145deg, #deb887, #cd853f)',
            border: '3px solid',
            borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
            borderRadius: '50%',
            color: '#8b4513',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
            fontFamily: 'inherit'
          }}
          onClick={prevImage}
          onMouseDown={(e) => e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513'}
          onMouseUp={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
          onMouseLeave={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
          title="Previous Image"
        >
          ←
        </button>

        {/* img holder*/}
        <div 
          style={{ 
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: zoomLevel > 1 ? 'auto' : 'hidden',
            padding: '60px',
            boxSizing: 'border-box'
          }}
        >
          {isLoading && !imageError && (
            <div style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#deb887',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Loading image...
            </div>
          )}
          
          {!imageError ? (
            <img 
              src={currentImage.url}
              alt={currentImage.name}
              style={{ 
                maxWidth: zoomLevel === 1 ? '100%' : 'none',
                maxHeight: zoomLevel === 1 ? '100%' : 'none',
                width: zoomLevel !== 1 ? `${100 * zoomLevel}%` : 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: isLoading ? 'none' : 'block',
                border: '4px solid #deb887',
                borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                transition: 'opacity 0.3s ease'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div 
              style={{ 
                width: '100%',
                height: '100%',
                maxWidth: '500px',
                maxHeight: '400px',
                background: 'linear-gradient(135deg, #ffd4a3, #ff8c42)',
                border: '4px solid #deb887',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ 
                textAlign: 'center', 
                color: '#8b4513', 
                padding: '40px',
                fontFamily: 'inherit'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.8 }}>🖼️</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {currentImage.name}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.75, marginBottom: '12px' }}>
                  Image not found
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: 1.4 }}>
                  Expected location:<br/>
                  <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: '2px' }}>
                    {currentImage.url}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* next arrow*/}
        <button 
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            background: 'linear-gradient(145deg, #deb887, #cd853f)',
            border: '3px solid',
            borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
            borderRadius: '50%',
            color: '#8b4513',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
            fontFamily: 'inherit'
          }}
          onClick={nextImage}
          onMouseDown={(e) => e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513'}
          onMouseUp={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
          onMouseLeave={(e) => e.target.style.borderColor = '#f5deb3 #8b4513 #8b4513 #f5deb3'}
          title="Next Image"
        >
          →
        </button>

        {/* keyboard hints */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: '#deb887',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          opacity: 0.8,
          zIndex: 5
        }}>
          Use arrows to navigate • {currentIndex + 1}/{images.length}
        </div>
      </div>

      {/* status bar */}
      <div 
        style={{ 
          background: 'linear-gradient(to right, #fff8dc, #ffd4a3)',
          borderTop: '2px solid #8b4513',
          padding: '8px 16px',
          color: '#8b4513',
          flexShrink: 0,
          height: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <span>
          📁 Image {currentIndex + 1} of {images.length} | 🔍 Zoom: {Math.round(zoomLevel * 100)}%
        </span>
        <span>
          {!imageError && !isLoading ? '✅ Loaded' : imageError ? '❌ Error' : '⏳ Loading...'}
        </span>
      </div>
    </div>
  );
}

export default ImageViewerApp;