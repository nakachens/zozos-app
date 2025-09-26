import React, { useState, useRef, useEffect, useCallback } from 'react';

const PaintApp = () => {
  //cCanvas and drawing states
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(10);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  
  // UI states
  const [showBrushSlider, setShowBrushSlider] = useState(false);
  const [showEraserSlider, setShowEraserSlider] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  
  // file management states
  const [currentFileName, setCurrentFileName] = useState('Untitled');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedFiles, setSavedFiles] = useState(() => {
    const saved = localStorage.getItem('paintApp_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [saveFileName, setSaveFileName] = useState('');

  // color palette
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#82E0AA', '#F8C471', '#F1948A', '#85929E', '#D5A6BD', '#A9CCE3'
  ];

  // canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return { x, y };
  }, []);

  // handle canvas mouse events
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getCanvasCoordinates(e);
    
    setIsDrawing(true);
    setLastPosition({ x, y });
    setHasUnsavedChanges(true);

    // for single clicks, draw a dot
    const ctx = canvas.getContext('2d');
    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = currentColor;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [currentTool, currentColor, brushSize, getCanvasCoordinates]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { x, y } = getCanvasCoordinates(e);
    const ctx = canvas.getContext('2d');

    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserSize;
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastPosition({ x, y });
  }, [isDrawing, lastPosition, currentTool, currentColor, brushSize, eraserSize, getCanvasCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // file operations
  const newCanvas = () => {
    if (hasUnsavedChanges) {
      setConfirmAction('new');
      setShowConfirmDialog(true);
    } else {
      createNewCanvas();
    }
  };

  const createNewCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCurrentFileName('Untitled');
    setHasUnsavedChanges(false);
    setShowConfirmDialog(false);
  };

  const saveCanvas = () => {
    if (currentFileName === 'Untitled' || currentFileName === '') {
      setShowSaveDialog(true);
      setSaveFileName('');
    } else {
      performSave(currentFileName);
    }
  };
  const performSave = (filename) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // creating a temporary canvas 2 ensure we get the full image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // copy the current canvas content
    tempCtx.drawImage(canvas, 0, 0);
    
    const imageData = tempCanvas.toDataURL('image/png');
    const fileData = {
      name: filename,
      data: imageData,
      timestamp: new Date().toISOString(),
      size: Math.round(imageData.length / 1024) + ' KB'
    };

    const updatedFiles = savedFiles.filter(f => f.name !== filename);
    updatedFiles.push(fileData);
    
    setSavedFiles(updatedFiles);
    localStorage.setItem('paintApp_files', JSON.stringify(updatedFiles));
    
    setCurrentFileName(filename);
    setHasUnsavedChanges(false);
    setShowSaveDialog(false);
    
    // clean up temp canvas
    tempCanvas.remove();
  };

  const openCanvas = (file) => {
    if (hasUnsavedChanges) {
      setConfirmAction(`open:${file.name}`);
      setShowConfirmDialog(true);
    } else {
      loadCanvas(file);
    }
  };

  const loadCanvas = (file) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      setCurrentFileName(file.name);
      setHasUnsavedChanges(false);
      setShowOpenDialog(false);
      setShowConfirmDialog(false);
    };
    
    img.onerror = () => {
      console.error('Failed to load image');
    };
    
    img.src = file.data;
  };

  const deleteFile = (filename) => {
    const updatedFiles = savedFiles.filter(f => f.name !== filename);
    setSavedFiles(updatedFiles);
    localStorage.setItem('paintApp_files', JSON.stringify(updatedFiles));
    setShowDeleteDialog(false);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'new') {
      createNewCanvas();
    } else if (confirmAction.startsWith('open:')) {
      const filename = confirmAction.split(':')[1];
      const file = savedFiles.find(f => f.name === filename);
      if (file) loadCanvas(file);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-100 flex flex-col relative" style={{ fontFamily: 'monospace' }}>
      {/* menu bar */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-300 p-2 flex items-center space-x-4 relative flex-shrink-0">
        {/* file menu*/}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="px-3 py-1 bg-amber-200 border-2 border-amber-400 hover:bg-amber-300 text-amber-900 font-bold text-sm"
          >
            File
          </button>
          
          {showFileMenu && (
            <div className="absolute top-8 left-0 bg-white border-2 border-amber-400 shadow-lg z-50 min-w-32">
              <button onClick={() => { newCanvas(); setShowFileMenu(false); }} 
                      className="w-full px-3 py-2 text-left hover:bg-amber-100 text-sm">New</button>
              <button onClick={() => { setShowOpenDialog(true); setShowFileMenu(false); }} 
                      className="w-full px-3 py-2 text-left hover:bg-amber-100 text-sm">Open</button>
              <button onClick={() => { saveCanvas(); setShowFileMenu(false); }} 
                      className="w-full px-3 py-2 text-left hover:bg-amber-100 text-sm">Save</button>
              <button onClick={() => { setShowDeleteDialog(true); setShowFileMenu(false); }} 
                      className="w-full px-3 py-2 text-left hover:bg-amber-100 text-sm">Delete</button>
            </div>
          )}
        </div>

        {/* brush tool*/}
        <div className="relative">
          <button
            onClick={() => { setCurrentTool('brush'); setShowBrushSlider(!showBrushSlider); }}
            className={`px-3 py-1 border-2 font-bold text-sm ${
              currentTool === 'brush' 
                ? 'bg-blue-300 border-blue-500 text-blue-900' 
                : 'bg-amber-200 border-amber-400 hover:bg-amber-300 text-amber-900'
            }`}
          >
            Brush
          </button>
          
          {showBrushSlider && (
            <div className="absolute top-8 left-0 bg-white border-2 border-amber-400 shadow-lg z-50 p-3 min-w-48">
              <div className="text-sm mb-2">Size: {brushSize}px</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">1</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(brushSize-1)/49*100}%, #e5e7eb ${(brushSize-1)/49*100}%, #e5e7eb 100%)`
                  }}
                />
                <span className="text-xs">50</span>
              </div>
            </div>
          )}
        </div>

        {/* eraser*/}
        <div className="relative">
          <button
            onClick={() => { setCurrentTool('eraser'); setShowEraserSlider(!showEraserSlider); }}
            className={`px-3 py-1 border-2 font-bold text-sm ${
              currentTool === 'eraser' 
                ? 'bg-red-300 border-red-500 text-red-900' 
                : 'bg-amber-200 border-amber-400 hover:bg-amber-300 text-amber-900'
            }`}
          >
            Eraser
          </button>
          
          {showEraserSlider && (
            <div className="absolute top-8 left-0 bg-white border-2 border-amber-400 shadow-lg z-50 p-3 min-w-48">
              <div className="text-sm mb-2">Size: {eraserSize}px</div>
              <div className="flex items-center space-x-2">
                <span className="text-xs">5</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={eraserSize}
                  onChange={(e) => setEraserSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(eraserSize-5)/95*100}%, #e5e7eb ${(eraserSize-5)/95*100}%, #e5e7eb 100%)`
                  }}
                />
                <span className="text-xs">100</span>
              </div>
            </div>
          )}
        </div>

        {/* color picker*/}
        <div className="relative">
          <button
            onClick={() => setShowColorPalette(!showColorPalette)}
            className="w-8 h-8 border-2 border-amber-400"
            style={{ backgroundColor: currentColor }}
          />
          
          {showColorPalette && (
            <div className="absolute top-10 left-0 bg-white border-2 border-amber-400 shadow-lg z-50 p-2">
              <div className="grid grid-cols-8 gap-1 w-48">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => { setCurrentColor(color); setCurrentTool('brush'); }}
                    className="w-6 h-6 border border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => { setCurrentColor(e.target.value); setCurrentTool('brush'); }}
                  className="w-full h-8"
                />
              </div>
            </div>
          )}
        </div>

        {/* current tool info*/}
        <div className="flex-1 text-center text-sm text-amber-800">
          {currentFileName} {hasUnsavedChanges ? '*' : ''} - {currentTool === 'brush' ? `Brush (${brushSize}px)` : `Eraser (${eraserSize}px)`}
        </div>
      </div>

      {/* canvas area */}
      <div className="flex-1 p-4 bg-gradient-to-br from-amber-50 to-orange-50 min-h-0">
        <div className="w-full h-full border-4 border-amber-400 bg-white shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="w-full h-full cursor-crosshair block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ 
              imageRendering: 'pixelated',
              touchAction: 'none'
            }}
          />
        </div>
      </div>

      {/* save dialogue */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-amber-400 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-amber-900">Save As</h3>
            <input
              type="text"
              value={saveFileName}
              onChange={(e) => setSaveFileName(e.target.value)}
              placeholder="Enter filename"
              className="w-64 p-2 border-2 border-amber-300 mb-4"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={() => saveFileName && performSave(saveFileName)}
                className="px-4 py-2 bg-green-500 text-white border-2 border-green-600 hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-red-500 text-white border-2 border-red-600 hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* open dialogue*/}
      {showOpenDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-amber-400 p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-amber-900">Open File</h3>
            <div className="max-h-64 overflow-y-auto border-2 border-amber-300 mb-4">
              {savedFiles.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No saved files</div>
              ) : (
                savedFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => openCanvas(file)}
                    className="p-3 border-b border-amber-200 cursor-pointer hover:bg-amber-50"
                  >
                    <div className="font-bold">{file.name}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(file.timestamp).toLocaleDateString()} - {file.size}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowOpenDialog(false)}
              className="px-4 py-2 bg-red-500 text-white border-2 border-red-600 hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* delete popup */}
      {showDeleteDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-amber-400 p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-amber-900">Delete Files</h3>
            <div className="max-h-64 overflow-y-auto border-2 border-amber-300 mb-4">
              {savedFiles.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No saved files</div>
              ) : (
                savedFiles.map((file, index) => (
                  <div key={index} className="p-3 border-b border-amber-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{file.name}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(file.timestamp).toLocaleDateString()} - {file.size}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFile(file.name)}
                      className="px-3 py-1 bg-red-500 text-white border border-red-600 hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 bg-gray-500 text-white border-2 border-gray-600 hover:bg-gray-600"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* confirmation dialog */}
      {showConfirmDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-amber-400 p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-amber-900">Unsaved Changes</h3>
            <p className="mb-4">You have unsaved changes. Do you want to save before continuing?</p>
            <div className="flex space-x-2">
              <button
                onClick={() => { saveCanvas(); handleConfirmAction(); }}
                className="px-4 py-2 bg-green-500 text-white border-2 border-green-600 hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-yellow-500 text-white border-2 border-yellow-600 hover:bg-yellow-600"
              >
                Don't Save
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-red-500 text-white border-2 border-red-600 hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* click outside to close menus */}
      {(showBrushSlider || showEraserSlider || showColorPalette || showFileMenu) && (
        <div
          className="absolute inset-0 z-40"
          onClick={() => {
            setShowBrushSlider(false);
            setShowEraserSlider(false);
            setShowColorPalette(false);
            setShowFileMenu(false);
          }}
        />
      )}

      {/* CSS for range sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default PaintApp;