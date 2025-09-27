/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';

const VirtualPet = ({ onPetClick }) => {
  const [position, setPosition] = useState({ x: 200, y: window.innerHeight - 420 });
  const [direction, setDirection] = useState(1);
  const [currentAnimation, setCurrentAnimation] = useState('walkRight');
  const [isClicked, setIsClicked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isWalking, setIsWalking] = useState(true);
  const [currentDragDialogue, setCurrentDragDialogue] = useState('');
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);
  
  const [mouseDownPosition, setMouseDownPosition] = useState(null);
  const [dragThreshold] = useState(5); 
  const [isInBackground, setIsInBackground] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  // forcing re-render of images
  const [animationKey, setAnimationKey] = useState(0);
  
  const petRef = useRef(null);
  const animationRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const contextMenuRef = useRef(null);
  
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
  
  const WALK_LEFT_BOUNDARY = 50;
  const WALK_RIGHT_BOUNDARY = window.innerWidth - PET_WIDTH - 50;
  const WALK_TOP_BOUNDARY = 250;
  const WALK_BOTTOM_BOUNDARY = window.innerHeight - 250;
  
  const DRAG_LEFT_BOUNDARY = 20; 
  const DRAG_RIGHT_BOUNDARY = window.innerWidth - PET_WIDTH - 20; 
  const DRAG_TOP_BOUNDARY = 10;
  const DRAG_BOTTOM_BOUNDARY = window.innerHeight - 250;
  
  const WALK_SPEED = 1;

  const animations = {
    walkRight: './animations/walking_right.gif',
    walkLeft: './animations/walking_left.gif',
    clickRight: './animations/click_right.gif', 
    clickLeft: './animations/click-left.gif',   
    drag: './animations/drag.png' 
  };

  // Simplified animation source getter 
  const getAnimationSrc = (animationType) => {
    return animations[animationType];
  };

  const walkingLoop = useCallback(() => {
    if (!isWalking || isDragging || isClicked) return;

    setPosition(prev => {
      let newX = prev.x + (direction * WALK_SPEED);
      let newDirection = direction;

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

  const handlePetRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) return;

    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

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

  const isClickInPetCenter = (clientX, clientY) => {
    if (!petRef.current) return false;
    
    const rect = petRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    return (
      relativeX >= CLICKABLE_OFFSET_X &&
      relativeX <= CLICKABLE_OFFSET_X + CLICKABLE_WIDTH &&
      relativeY >= CLICKABLE_OFFSET_Y &&
      relativeY <= CLICKABLE_OFFSET_Y + CLICKABLE_HEIGHT
    );
  };

  // simplified click handler
  const handlePetClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInBackground) return;
    if (isClicked || isDragging || justFinishedDragging) return;
    if (!isClickInPetCenter(e.clientX, e.clientY)) return;

    console.log('Pet clicked - starting click animation');
    
    // no delays, immediate reaction
    setIsClicked(true);
    setIsWalking(false);
    
    // set click animation immediately
    const clickAnimationType = direction === 1 ? 'clickRight' : 'clickLeft';
    setCurrentAnimation(clickAnimationType);
    
    // force rendering
    setAnimationKey(prev => prev + 1);
    
    if (onPetClick) {
      onPetClick();
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // resume walking after animation
    clickTimeoutRef.current = setTimeout(() => {
      console.log('Click animation finished, resuming walking...');
      setIsClicked(false);
      if (!isInBackground) {
        setIsWalking(true);
        setCurrentAnimation(direction === 1 ? 'walkRight' : 'walkLeft');
        setAnimationKey(prev => prev + 1); // Force re-render for walking animation
      }
    }, 1500);
  };

  const handleMouseDown = (e) => {
    if (isClicked && !isInBackground) return;

    setMouseDownPosition({ x: e.clientX, y: e.clientY });
    
    const rect = petRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    setShowContextMenu(false);
  };

  useEffect(() => {
    let hasMoved = false;
    let hasPassedThreshold = false;

    const handleMouseMove = (e) => {
      if (!mouseDownPosition) return;

      const deltaX = Math.abs(e.clientX - mouseDownPosition.x);
      const deltaY = Math.abs(e.clientY - mouseDownPosition.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > dragThreshold && !hasPassedThreshold) {
        hasPassedThreshold = true;
        setIsDragging(true);
        setIsWalking(false);
        setCurrentAnimation('drag');
        setAnimationKey(prev => prev + 1);
        
        const randomDialogue = dragDialogues[Math.floor(Math.random() * dragDialogues.length)];
        setCurrentDragDialogue(randomDialogue);
        
        console.log('Drag threshold passed, starting drag...');
      }

      if (isDragging || hasPassedThreshold) {
        hasMoved = true;

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
        
        if (hasMoved) {
          setJustFinishedDragging(true);
          setTimeout(() => {
            setJustFinishedDragging(false);
          }, 200); 
        }
        
        setIsWalking(true);
        setCurrentAnimation(direction === 1 ? 'walkRight' : 'walkLeft');
        setAnimationKey(prev => prev + 1);
        
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else if (mouseDownPosition && !hasMoved) {
        if (isClickInPetCenter(e.clientX, e.clientY)) {
          handlePetClick(e);
        }
      }
      
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
        {/* rendered image */}
        <img
          key={`${currentAnimation}-${animationKey}`} // forces to create a new img element
          src={getAnimationSrc(currentAnimation)}
          alt="Haku"
          className="w-full h-full object-contain"
          style={{
            imageRendering: 'pixelated',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          draggable={false}
          onError={(e) => {
            console.warn(`Failed to load pet animation: ${e.target.src}`);
            e.target.src = './animations/walking_right.gif';
          }}
        />
        
        {/* click animation chat */}
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

        {/* drag animation chat*/}
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

      {/* context menu */}
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
            {isInBackground ? 'Hakuchin is behind apps' : 'Hakuchin is in front of apps'}
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualPet;