/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Import the asset preloader if you create it, otherwise remove this line
// import { globalAssetPreloader } from './AssetPreloader';

const VirtualPet = ({ onPetClick }) => {
  // Fix 1: Spawn above taskbar (48px + margin = 120px from bottom)
  const [position, setPosition] = useState({ x: 200, y: window.innerHeight - 420 }); // Spawn above taskbar
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [currentAnimation, setCurrentAnimation] = useState('walkRight');
  const [isClicked, setIsClicked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isWalking, setIsWalking] = useState(true);
  const [currentDragDialogue, setCurrentDragDialogue] = useState('');
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);
  
  const [mouseDownPosition, setMouseDownPosition] = useState(null);
  const [dragThreshold] = useState(5); 
  // layer management 
  const [isInBackground, setIsInBackground] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const petRef = useRef(null);
  const animationRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const contextMenuRef = useRef(null);
  
  // cute drag dialogues
  const dragDialogues = [
    " waa not again~! ",
    " w-what are you trying to do!! ",
    " hey! put me down please ",
    " not there waa!! ",
    " im scared zochaann!! ",
    " put me down please!! ",
    " ill cry pls put me down ",
    " what have i done wrong waaaa ",
    " zochan save mee~ ",
    "im scared of heights!!"
  ];
  
  const PET_WIDTH = 300;  
  const PET_HEIGHT = 300; 
  const CLICKABLE_WIDTH = 120;  
  const CLICKABLE_HEIGHT = 120; 
  const CLICKABLE_OFFSET_X = (PET_WIDTH - CLICKABLE_WIDTH) / 2; 
  const CLICKABLE_OFFSET_Y = (PET_HEIGHT - CLICKABLE_HEIGHT) / 2; 
  
  // separate boundaries for walking vs dragging
  // walking boundaries (away from desktop icons and above taskbar)
  const WALK_LEFT_BOUNDARY = 50; // away from desktop icons
  const WALK_RIGHT_BOUNDARY = window.innerWidth - PET_WIDTH - 50; // space from right edge
  const WALK_TOP_BOUNDARY = 250; // from desktop widgets area
  const WALK_BOTTOM_BOUNDARY = window.innerHeight - 250; // above taskbar
  
  // dragging boundaries (nearly fullscreen)
  const DRAG_LEFT_BOUNDARY = 20; 
  const DRAG_RIGHT_BOUNDARY = window.innerWidth - PET_WIDTH - 20; 
  const DRAG_TOP_BOUNDARY = 10; // small edge margin
  const DRAG_BOTTOM_BOUNDARY = window.innerHeight - 250;
  
  // walking speed
  const WALK_SPEED = 1;

  // animation sources with optimized loading
  const animations = {
    walkRight: './animations/walking_right.gif',
    walkLeft: './animations/walking_left.gif',
    clickRight: './animations/click_right.gif', 
    clickLeft: './animations/click-left.gif',   
    drag: './animations/drag.png' 
  };

  // Optimized animation source getter
  const getOptimizedAnimationSrc = (animationType) => {
    const src = animations[animationType];
    
    // Check if we have the global asset preloader available
    if (typeof window !== 'undefined' && window.globalAssetPreloader) {
      const preloadedAsset = window.globalAssetPreloader.loadedAssets.get(src);
      if (preloadedAsset && preloadedAsset instanceof Image) {
        return preloadedAsset.src;
      }
    }
    
    return src;
  };

  // Preload animation function
  const preloadAnimation = (animationType) => {
    const src = animations[animationType];
    if (typeof window !== 'undefined' && window.globalAssetPreloader) {
      window.globalAssetPreloader.preloadImage(src).catch(error => {
        console.warn(`Failed to preload animation ${src}:`, error);
      });
    } else {
      // Fallback preloading without asset manager
      const img = new Image();
      img.src = src;
    }
  };

  // animation loop
  const walkingLoop = useCallback(() => {
    if (!isWalking || isDragging || isClicked) return;

    setPosition(prev => {
      let newX = prev.x + (direction * WALK_SPEED);
      let newDirection = direction;

      // walking boundaries and reverse direction
      if (newX <= WALK_LEFT_BOUNDARY) {
        newX = WALK_LEFT_BOUNDARY;
        newDirection = 1;
        setDirection(1);
        setCurrentAnimation('walkRight');
      } else if (newX >= WALK_RIGHT_BOUNDARY) {
        newX = WALK_RIGHT_BOUNDARY;
        newDirection = -1;
        setDirection(-1);
        setCurrentAnimation('walkLeft');
      }

      return { x: newX, y: prev.y };
    });

    animationRef.current = requestAnimationFrame(walkingLoop);
  }, [direction, isWalking, isDragging, isClicked]);

  // start walking animation
  useEffect(() => {
    if (isWalking && !isDragging && !isClicked) {
      animationRef.current = requestAnimationFrame(walkingLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [walkingLoop, isWalking, isDragging, isClicked]);

  // Preload likely next animations on mount and state changes
  useEffect(() => {
    // Preload all animations on component mount
    Object.keys(animations).forEach(animationType => {
      preloadAnimation(animationType);
    });
  }, []);

  // handle right click to show context menu (changed from left click)
  const handlePetRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // dont trigger context menu if dragging
    if (isDragging) return;

    // show context menu
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // context menu actions with proper state management
  const handleMoveToBack = () => {
    console.log('Moving to back...');
    
    setIsInBackground(true);
    setIsClicked(false);
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    setIsWalking(true);
    setCurrentAnimation(direction === 1 ? 'walkRight' : 'walkLeft');
    setShowContextMenu(false);
  };

  const handleBringToFront = () => {
    console.log('Bringing to front...');
    
    setIsInBackground(false);
    setIsClicked(false);
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    setIsWalking(true);
    setCurrentAnimation(direction === 1 ? 'walkRight' : 'walkLeft');
    setShowContextMenu(false);
  };

  // click detection with position checking and drag threshold
  const isClickInPetCenter = (clientX, clientY) => {
    if (!petRef.current) return false;
    
    const rect = petRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // check if click is within the centered clickable area
    return (
      relativeX >= CLICKABLE_OFFSET_X &&
      relativeX <= CLICKABLE_OFFSET_X + CLICKABLE_WIDTH &&
      relativeY >= CLICKABLE_OFFSET_Y &&
      relativeY <= CLICKABLE_OFFSET_Y + CLICKABLE_HEIGHT
    );
  };

  const handlePetClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // in background mode, don't do click animations, just allow dragging
    if (isInBackground) return;

    // don't trigger click if already clicked, dragging, or just finished dragging
    if (isClicked || isDragging || justFinishedDragging) return;

    //  trigger click animation if clicking in the pet's center area
    if (!isClickInPetCenter(e.clientX, e.clientY)) return;

    console.log('cutie was clicked in center area!');
    
    setIsClicked(true);
    setIsWalking(false);
    
    // using directional click animation based on current walking direction
    const clickAnimationType = direction === 1 ? 'clickRight' : 'clickLeft';
    
    // Simple approach - just set the animation and let React handle the src change
    setCurrentAnimation(clickAnimationType);
    
    // Force reload the GIF by adding timestamp in the next tick
    setTimeout(() => {
      const imgElement = petRef.current?.querySelector('img');
      if (imgElement && isClicked) {
        const timestamp = Date.now();
        const animationSrc = getOptimizedAnimationSrc(clickAnimationType);
        imgElement.src = `${animationSrc}?t=${timestamp}`;
      }
    }, 10);

    if (onPetClick) {
      onPetClick();
    }

    // shorter timeout and ensure animation plays only once
    clickTimeoutRef.current = setTimeout(() => {
      console.log('Click animation finished, resuming walking...');
      setIsClicked(false);
      if (!isInBackground) {
        setIsWalking(true);
        setCurrentAnimation(direction === 1 ? 'walkRight' : 'walkLeft');
      }
    }, 1500); 
  };

  // mouse down handler with position tracking
  const handleMouseDown = (e) => {
    // no dragging during click animation (unless in background where clicks are disabled)
    if (isClicked && !isInBackground) return;

    // Store mouse down position for drag threshold calculation
    setMouseDownPosition({ x: e.clientX, y: e.clientY });

    console.log('Mouse down detected...');
    
    const rect = petRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // clear any pending click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // hide context menu if mouse down starts
    setShowContextMenu(false);
  };

  // improved dragging with threshold detection
  useEffect(() => {
    let hasMoved = false;
    let hasPassedThreshold = false;

    const handleMouseMove = (e) => {
      if (!mouseDownPosition) return;

      // calculate distance from initial mouse down position
      const deltaX = Math.abs(e.clientX - mouseDownPosition.x);
      const deltaY = Math.abs(e.clientY - mouseDownPosition.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // only start dragging if we've moved beyond the threshold
      if (distance > dragThreshold && !hasPassedThreshold) {
        hasPassedThreshold = true;
        setIsDragging(true);
        setIsWalking(false);
        setCurrentAnimation('drag');
        
        // random dialogue when dragging starts
        const randomDialogue = dragDialogues[Math.floor(Math.random() * dragDialogues.length)];
        setCurrentDragDialogue(randomDialogue);
        
        console.log('Drag threshold passed, starting drag...');
      }

      if (isDragging || hasPassedThreshold) {
        hasMoved = true;

        // different boundaries for dragging
        const leftBoundary = DRAG_LEFT_BOUNDARY;
        const rightBoundary = DRAG_RIGHT_BOUNDARY;
        const topBoundary = DRAG_TOP_BOUNDARY;
        const bottomBoundary = DRAG_BOTTOM_BOUNDARY;

        const newX = Math.max(
          leftBoundary,
          Math.min(rightBoundary, e.clientX - dragOffset.x)
        );
        const newY = Math.max(
          topBoundary,
          Math.min(bottomBoundary, e.clientY - dragOffset.y)
        );

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = (e) => {
      const wasDragging = isDragging || hasPassedThreshold;
      
      if (wasDragging) {
        console.log('Drag ended, resuming walking...');
        setIsDragging(false);
        
        // set flag that we just finished dragging to prevent immediate click
        if (hasMoved) {
          setJustFinishedDragging(true);
          setTimeout(() => {
            setJustFinishedDragging(false);
          }, 200); 
        }
        
        setIsWalking(true);
        setCurrentAnimation(direction === 1 ? 'walkRight' : 'walkLeft');
        
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else if (mouseDownPosition && !hasMoved) {
        // trigger click if we didn't drag AND mouse is still in pet center
        if (isClickInPetCenter(e.clientX, e.clientY)) {
          handlePetClick(e);
        }
      }
      
      // reset mouse tracking
      setMouseDownPosition(null);
    };

    if (mouseDownPosition) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'default';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (isDragging) {
        document.body.style.cursor = 'default';
      }
    };
  }, [isDragging, dragOffset, direction, mouseDownPosition, dragThreshold, isInBackground, isClicked, justFinishedDragging]);

  // close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={petRef}
        className="absolute pointer-events-auto select-none"
        style={{
          left: position.x,
          top: position.y,
          width: PET_WIDTH,
          height: PET_HEIGHT,
          zIndex: isInBackground ? 1 : 100,
          cursor: isDragging ? 'grabbing' : 'pointer',
          transition: isDragging ? 'none' : 'none',
        }}
        onContextMenu={handlePetRightClick}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* image with optimized animation control */}
        <img
          src={currentAnimation === 'clickRight' || currentAnimation === 'clickLeft' 
            ? `${getOptimizedAnimationSrc(currentAnimation)}?t=${Date.now()}` // Force reload for click animations
            : getOptimizedAnimationSrc(currentAnimation)
          }
          alt="Haku"
          className="w-full h-full object-contain"
          style={{
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          draggable={false}
          onLoad={(e) => {
            // Pre-cache the next likely animations when current animation loads
            if (currentAnimation.includes('walk')) {
              const nextClickAnim = direction === 1 ? 'clickRight' : 'clickLeft';
              preloadAnimation(nextClickAnim);
            }
            
            e.target.onerror = () => {
              console.warn(`Failed to load pet animation: ${e.target.src}`);
            };
          }}
          onError={(e) => {
            console.warn(`Failed to load pet animation: ${e.target.src}`);
            // Fallback to basic walking animation
            e.target.src = './animations/walking_right.gif';
          }}
        />
        
        
        {/* click animation bubble */}
        {isClicked && !isInBackground && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 bg-amber-100 border-2 px-2 py-1 rounded-lg text-xs font-bold"
            style={{
              top: '45px',
              borderColor: '#8b4513',
              color: '#8b4513',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              zIndex: 101
            }}
          >
            Hello! ^_^
          </div>
        )}

        {/* drag animation bubble */}
        {isDragging && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 bg-orange-100 border-2 px-4 py-2 rounded-lg text-xs font-bold animate-bounce"
            style={{
              top: '65px',
              borderColor: '#967456ff',
              color: '#543e00ff',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              zIndex: 101,
              padding:'10px'
            }}
          >
            {currentDragDialogue}
          </div>
        )}
      </div>

      {/* context */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gradient-to-b from-amber-100 to-orange-100 border-4 shadow-2xl rounded-lg py-2 z-200"
          style={{
            left: Math.min(contextMenuPosition.x, window.innerWidth - 160),
            top: Math.max(contextMenuPosition.y - 80, 10),
            minWidth: '160px',
            borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
            borderStyle: 'solid',
            fontFamily: 'monospace'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isInBackground ? (
            <button
              className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-200 flex items-center space-x-2 border-b border-amber-300"
              onClick={handleBringToFront}
              style={{ fontFamily: 'monospace' }}
            >
              <span>⬆️</span>
              <span>Bring to Front</span>
            </button>
          ) : (
            <button
              className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-200 flex items-center space-x-2 border-b border-amber-300"
              onClick={handleMoveToBack}
              style={{ fontFamily: 'monospace' }}
            >
              <span>⬇️</span>
              <span>Move to Back</span>
            </button>
          )}
          <div className="px-4 py-1 text-xs text-amber-700">
            {isInBackground ? 'Pet is behind apps' : 'Pet is in front of apps'}
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualPet;