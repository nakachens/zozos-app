/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from './LoadingScreen';
import { globalAssetPreloader, MUSIC_ASSETS, GAME_ASSETS } from './AssetPreloader';

// all apps
import CalculatorApp from './apps/CalculatorApp';
import MusicPlayerApp from './apps/MusicPlayerApp';
import WeatherApp from './apps/WeatherApp';
import TicTacToeApp from './apps/TicTacToeApp';
import NotebookApp from './apps/NotebookApp';
import LeavesGameApp from './apps/LeavesGameApp';
import SearchEngineApp from './apps/SearchEngineApp';
import PoetryApp from './apps/PoetryApp';
import MemoryGame from './apps/MemoryGame';
import SnakeGame from './apps/SnakeGame';
import PaintApp from './apps/PaintApp';
// cute guy
import VirtualPet from './apps/VirtualPet';
//components
import WiFiSidebar from './extras/WiFiSidebar';
import TxtFileApp from './extras/TxtFileApp';
import { FolderApp, fileContents } from './extras/FolderApp';
import ImageViewerApp from './extras/ImageViewerApp';
//asset finder
const getAssetPath = (path) => {
  if (window.require) {
    try {
      const { remote, ipcRenderer } = window.require('electron');
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        return path; 
      } else {
        const pathModule = window.require('path');
        const appPath = remote ? remote.app.getAppPath() : process.resourcesPath;
        return pathModule.join(appPath, path.replace('./', ''));
      }
    } catch (error) {
      console.log('Electron modules not available, using web paths');
    }
  }
  
  return path; // ps: this was for electron setup
};

// sound effects
const useSound = () => {
  const clickSoundRef = useRef(null);
  const keyboardSoundRef = useRef(null);

  useEffect(() => {
    clickSoundRef.current = new Audio('./click.mp3');
    clickSoundRef.current.volume = 0.3;
    
    keyboardSoundRef.current = new Audio('./click.mp3');
    keyboardSoundRef.current.volume = 0.2;
  }, []);

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(error => {
        console.log("Click sound play failed:", error);
      });
    }
  };

  const playKeyboardSound = () => {
    if (keyboardSoundRef.current) {
      keyboardSoundRef.current.currentTime = 0;
      keyboardSoundRef.current.play().catch(error => {
        console.log("Keyboard sound play failed:", error);
      });
    }
  };

  return { playClickSound, playKeyboardSound };
};

// widget wrapper 
function DraggableWidget({ children, initialPosition, widgetId, onPositionChange }) {
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { playClickSound } = useSound();

  const handleMouseDown = (e) => {
    if (e.target.closest('.widget-button')) {
      playClickSound();
      return;
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newPosition = {
          x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y))
        };
        setPosition(newPosition);
        if (onPositionChange) onPositionChange(widgetId, newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'move';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, dragOffset, onPositionChange, widgetId]);

  return (
    <div 
      className="absolute select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'move' : 'default',
        zIndex: isDragging ? 5 : 1 
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}

// clockWidget 
function ClockWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [flipClass, setFlipClass] = useState('');
  const { playClickSound } = useSound();

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      const oldMinute = currentTime.getMinutes();
      const newMinute = newTime.getMinutes();
      
      if (oldMinute !== newMinute) {
        setFlipClass('flip');
        setTimeout(() => setFlipClass(''), 500);
      }
      
      setCurrentTime(newTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime]);

  const formatTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFormatToggle = () => {
    playClickSound();
    setIs24Hour(!is24Hour);
  };

  return (
    <div className="bg-gradient-to-b from-amber-100 to-orange-100 border-4 p-3 rounded-lg shadow-lg cursor-move" 
         style={{ 
           fontFamily: 'Courier New, monospace',
           borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
           borderStyle: 'solid',
           width: '200px'
         }}>
      <div className="flex justify-between items-center mb-2 pb-1 border-b-2 border-amber-300">
        <span className="text-amber-900 font-bold text-xs">CLOCK</span>
        <button
          className="widget-button px-2 py-1 text-xs border-2 bg-amber-200 hover:bg-amber-300"
          onClick={handleFormatToggle}
          style={{
            borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
            color: '#8b4513'
          }}
        >
          {is24Hour ? '12H' : '24H'}
        </button>
      </div>

      <div className="text-center">
        <div className={`text-lg font-bold text-amber-900 ${flipClass}`} 
             style={{ 
               fontFamily: 'monospace',
               textShadow: '1px 1px 2px rgba(139,69,19,0.3)',
               letterSpacing: '1px'
             }}>
          {formatTime()}
        </div>
        <div className="text-xs text-amber-700 mt-1">
          {formatDate()}
        </div>
      </div>
    </div>
  );
}

// calendar widget component
function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { playClickSound } = useSound();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    playClickSound();
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const navigateMonth = (direction) => {
    playClickSound();
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-5 h-5"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`w-5 h-5 text-xs flex items-center justify-center border ${
            isToday ? 'bg-orange-300 border-orange-500 font-bold' :
            'hover:bg-amber-100 border-transparent'
          }`}
          style={{ 
            color: isToday ? '#8b4513' : '#92400e',
            fontFamily: 'monospace'
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-gradient-to-b from-amber-100 to-orange-100 border-4 p-3 rounded-lg shadow-lg"
         style={{ 
           fontFamily: 'Courier New, monospace',
           borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
           borderStyle: 'solid',
           width: '180px'
         }}>
      <div className="flex justify-between items-center mb-2 pb-1 border-b-2 border-amber-300">
        <button 
          onClick={() => navigateMonth(-1)}
          className="px-1 py-1 text-xs border-2 bg-amber-200 hover:bg-amber-300"
          style={{ borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3', color: '#8b4513' }}
        >
          ◀
        </button>
        <span className="text-amber-900 font-bold text-xs">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button 
          onClick={() => navigateMonth(1)}
          className="px-1 py-1 text-xs border-2 bg-amber-200 hover:bg-amber-300"
          style={{ borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3', color: '#8b4513' }}
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="w-5 h-5 text-xs font-bold text-amber-800 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  );
}

// task list widget
function TaskListWidget() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Check emails', completed: true },
    { id: 2, text: 'Finish project', completed: false },
    { id: 3, text: 'Call mom', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');
  const { playClickSound, playKeyboardSound } = useSound();

  const addTask = () => {
    playClickSound();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    playClickSound();
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleInputChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const handleKeyDown = (e) => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      playKeyboardSound();
    }
  };

  return (
    <div className="border-4 p-3 rounded-lg shadow-lg cursor-move"
         style={{ 
           fontFamily: 'Courier New, monospace',
           borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
           borderStyle: 'solid',
           width: '200px',
           height: '150px',
           background: '#A9C49C'
         }}>
      <div className="flex items-center mb-2 pb-1 border-b-2"
           style={{ borderColor: 'rgba(139, 69, 19, 0.3)' }}>
        <span className="text-amber-900 font-bold text-xs">TASKS</span>
      </div>

      <div className="space-y-1 mb-3 max-h-15 overflow-y-auto">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-2">
            <button
              className="widget-button w-3 h-3 border text-xs flex items-center justify-center"
              onClick={() => toggleTask(task.id)}
              style={{ 
                borderColor: 'rgba(139, 69, 19, 0.4)',
                backgroundColor: task.completed ? '#22c55e' : 'rgba(255, 255, 255, 0.7)',
                color: task.completed ? 'white' : '#8b4513'
              }}
            >
              {task.completed ? '✓' : ''}
            </button>
            <span 
              className={`text-xs ${task.completed ? 'line-through' : ''}`}
              style={{ 
                fontSize: '10px',
                color: task.completed ? 'rgba(139, 69, 19, 0.6)' : '#8b4513'
              }}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <input
          type="text"
          value={newTask}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          placeholder="New task..."
          className="widget-button w-full text-xs p-1 border"
          style={{ 
            fontFamily: 'monospace', 
            fontSize: '10px',
            borderColor: 'rgba(139, 69, 19, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        />
        <button
          className="widget-button w-full px-2 py-1 text-xs border-2 hover:opacity-90"
          onClick={addTask}
          style={{ 
            borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3', 
            color: '#8b4513',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          ADD
        </button>
      </div>
    </div>
  );
}

// focus goals/ progress widget
function FocusGoalsWidget() {
  const [goals, setGoals] = useState([
    { id: 1, text: 'Finish React project', progress: 75, priority: 'high' },
    { id: 2, text: 'Learn new skill', progress: 40, priority: 'medium' },
    { id: 3, text: 'Exercise routine', progress: 60, priority: 'high' }
  ]);

  const [newGoal, setNewGoal] = useState('');
  const { playClickSound, playKeyboardSound } = useSound();

  const updateProgress = (id, change) => {
    playClickSound();
    setGoals(goals.map(goal => 
      goal.id === id ? {
        ...goal,
        progress: Math.max(0, Math.min(100, goal.progress + change))
      } : goal
    ));
  };

  const addGoal = () => {
    playClickSound();
    if (newGoal.trim()) {
      setGoals([...goals, {
        id: Date.now(),
        text: newGoal,
        progress: 0,
        priority: 'medium'
      }]);
      setNewGoal('');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-blue-900';
      case 'medium': return 'text-black-600';
      case 'low': return 'text-green-600';
      default: return 'text-amber-600';
    }
  };

  const handleInputChange = (e) => {
    setNewGoal(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addGoal();
    }
  };

  const handleKeyDown = (e) => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      playKeyboardSound();
    }
  };

  return (
    <div className="border-4 p-3 rounded-lg shadow-lg cursor-move"
         style={{ 
           fontFamily: 'Courier New, monospace',
           borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
           borderStyle: 'solid',
           width: '240px',
           height: '180px',
           background: '#D0B0CF'
         }}>
      <div className="flex items-center mb-2 pb-1 border-b-2"
           style={{ borderColor: 'rgba(139, 69, 19, 0.3)' }}>
        <span className="text-amber-900 font-bold text-xs">PROGRESS</span>
      </div>

      <div className="space-y-2 max-h-25 overflow-y-auto mb-3">
        {goals.map(goal => (
          <div key={goal.id} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${getPriorityColor(goal.priority)}`} style={{ fontSize: '10px' }}>
                {goal.text}
              </span>
              <span className="text-xs text-amber-700">{goal.progress}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="widget-button w-4 h-4 text-xs border hover:opacity-90"
                onClick={() => updateProgress(goal.id, -10)}
                style={{ 
                  borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3', 
                  fontSize: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                -
              </button>
              <div className="flex-1 h-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${goal.progress}%`,
                    backgroundColor: '#8b4513'
                  }}
                />
              </div>
              <button
                className="widget-button w-4 h-4 text-xs border hover:opacity-90"
                onClick={() => updateProgress(goal.id, 10)}
                style={{ 
                  borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3', 
                  fontSize: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-2 pt-2 space-y-1"
           style={{ borderColor: 'rgba(139, 69, 19, 0.3)' }}>
        <input
          type="text"
          value={newGoal}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          placeholder="New goal..."
          className="widget-button w-full text-xs p-1 border"
          style={{ 
            fontFamily: 'monospace', 
            fontSize: '10px',
            borderColor: 'rgba(139, 69, 19, 0.4)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        />
      </div>
    </div>
  );
}

// AppWrapper ith special cases
function AppWrapper({ children, appId }) {
  const wrapperStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent'
  };

  // special handling for leaves game 
  if (appId === 'leaves') {
    return (
      <div style={{
        ...wrapperStyle,
        contain: 'layout style paint size',
        isolation: 'isolate',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '100%',
          maxHeight: '100%',
          contain: 'layout style paint size',
          isolation: 'isolate',
        }}>
          {children}
        </div>
      </div>
    );
  }

  // calculator app 
  if (appId === 'calc') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
      </div>
    );
  }

  // MUSIC PLAYER 
  if (appId === 'music') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto'
        }}>
          {children}
        </div>
      </div>
    );
  }

  // TICTACTOE 
  if (appId === 'tic') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
      </div>
    );
  }

  // WEATHER 
  if (appId === 'weather') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto',
          padding: '18px 10px', 
          boxSizing: 'border-box' 
        }}>
          {children}
        </div>
      </div>
    );
  }

  // POETRY 
  if (appId === 'poetry') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
      </div>
    );
  }

  // MEMORY GAME 
  if (appId === 'memory') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto'
        }}>
          {children}
        </div>
      </div>
    );
  }

  // SEARCH ENGINE 
  if (appId === 'search') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto'
        }}>
          {children}
        </div>
      </div>
    );
  }

  // NOTEBOOK 
  if (appId === 'notes') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'auto'
        }}>
          {children}
        </div>
      </div>
    );
  }
// GOBBLER
if (appId === 'snake') {
    return (
      <div style={{
        ...wrapperStyle,
        contain: 'layout style paint size',
        isolation: 'isolate',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: '100%',
          maxHeight: '100%',
          contain: 'layout style paint size',
          isolation: 'isolate',
        }}>
          {children}
        </div>
      </div>
    );
  }
  //PAINT
if (appId === 'paint') {
    return (
      <div style={wrapperStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {children}
        </div>
      </div>
    );
  }
 // IMAGE VIEWER
  if (appId.startsWith('img-')) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'block' 
      }}>
        {children}
      </div>
    );
  }

  // TXT FILES 
  if (appId.startsWith('txt-') || appId.startsWith('zozo-txt-')) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'block' 
      }}>
        {children}
      </div>
    );
  }

// FOLDER 
if (appId === 'folder' || appId === 'images') {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {children}
    </div>
  );
}

  // default wrapper 
  return (
    <div style={wrapperStyle}>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
}

const appsList = [
  { 
    id: "calc", 
    name: "Calculator", 
    icon: getAssetPath("./assets/calculator.png"), 
    component: CalculatorApp, 
    size: { width: 280, height: 430 } 
  },
  { 
    id: "music", 
    name: "Music Player", 
    icon: getAssetPath("./assets/music.png"), 
    component: MusicPlayerApp, 
    size: { width: 400, height: 520 } 
  },
  { 
    id: "weather", 
    name: "Weather", 
    icon: getAssetPath("./assets/weather.png"), 
    component: WeatherApp, 
    size: { width: 520, height: 500 } 
  },
  { 
    id: "tic", 
    name: "TicTacToe", 
    icon: getAssetPath("./assets/tictactoe.png"), 
    component: TicTacToeApp, 
    size: { width: 350, height: 465 } 
  },
  { 
    id: "notes", 
    name: "Notebook", 
    icon: getAssetPath("./assets/notebook.png"), 
    component: NotebookApp, 
    size: { width: 620, height: 470 } 
  },
  { 
    id: "leaves", 
    name: "Leaves Game", 
    icon: getAssetPath("./assets/leaves.png"), 
    component: LeavesGameApp, 
    size: { width: 400, height: 450 } 
  },
  { 
    id: "search", 
    name: "Search Engine", 
    icon: getAssetPath("./assets/search.png"), 
    component: SearchEngineApp, 
    size: { width: 500, height: 600 } 
  },
  { 
    id: "poetry", 
    name: "Poetry", 
    icon: getAssetPath("./assets/poetry.png"), 
    component: PoetryApp, 
    size: { width: 400, height: 480 } 
  },
  { 
    id: "memory", 
    name: "Memory Game", 
    icon: getAssetPath("./assets/memory.png"), 
    component: MemoryGame, 
    size: { width: 390, height: 550 } 
  },
  { 
  id: "snake", 
  name: "Snake Game", 
  icon: getAssetPath("./assets/snakey.png"), 
  component: SnakeGame, 
  size: { width: 450, height: 500 } 
},
  { 
    id: "paint", 
    name: "Paint", 
    icon: getAssetPath("./assets/paint.png"), 
    component: PaintApp, 
    size: { width: 900, height: 700 } 
  },
  { 
    id: "folder", 
    name: "Folder", 
    icon: getAssetPath("./assets/folder.png"), 
    component: FolderApp, 
    size: { width: 600, height: 500 } 
  },
  { 
    id: "images", 
    name: "Images", 
    icon: getAssetPath("./assets/folder.png"), 
    component: FolderApp, 
    size: { width: 600, height: 500 } 
  }
];

// welcome screen component
function WelcomeScreen({ onContinue }) {
  const { playClickSound } = useSound();

  const handleClick = () => {
    playClickSound();
    onContinue();
  };

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center cursor-pointer relative overflow-hidden"
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, #492000ff 0%, #4b2310ff 100%)',
        fontFamily: 'monospace'
      }}
    >
      {/* bg */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              background: ['#ff8c42', '#ff6b35', '#ffa500', '#daa520'][Math.floor(Math.random() * 4)],
              opacity: 0.4 + Math.random() * 0.6
            }}
          />
        ))}
      </div>
      
      <div className="text-center relative z-10">
        {/* title */}
        <div className="text-8xl font-bold mb-4 relative inline-block"
        style={{
          fontFamily: 'zozafont, monospace', 
          color: "wheat",
          textShadow: `
          2px 2px 0px #783e00ff,
          4px 4px 0px #783e00ff,
          6px 6px 0px #783e00ff,
          8px 8px 0px #783e00ff,
          10px 10px 20px #783e00ff
          `,
          letterSpacing: '0.1em'
        }}
      >
      zozOS
      </div>
          
          {/* subtitle */}
          <div 
            className="text-xl font-bold tracking-widest"
            style={{
              fontFamily: 'monospace',
              color: '#d2bfb0ff',
              textShadow: '2px 2px 0px #a0522d, 4px 4px 8px rgba(0,0,0,0.2)',
              letterSpacing: '0.3em'
            }}
          >
            TIME TO LOG IN?
          </div>
        {/* menu options (fake)*/}
        <div className="space-y-6 text-2xl font-bold" style={{ fontFamily: 'monospace' }}>
          <div 
            className="hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              color: '#d2c4baff',
              textShadow: '2px 2px 0px #654321, 4px 4px 8px rgba(0,0,0,0.2)',
              letterSpacing: '0.2em'
            }}
          >
            ▶ START SYSTEM
          </div>
        </div>

        {/* bottom instruction */}
        <div className="mt-16 text-sm opacity-70 animate-pulse" style={{ 
          fontFamily: 'monospace',
          color: '#9c9c9cff',
          letterSpacing: '0.1em'
        }}>
          CLICK ANYWHERE TO PROCEED
        </div>

        {/* copyright */}
        <div className="mt-8 text-xs opacity-50" style={{ 
          fontFamily: 'monospace',
          color: '#9c9c9cff',
          letterSpacing: '0.1em'
        }}>
          © 2025 ZOZA SYSTEMS
        </div>
      </div>
    </div>
  );
}

// LoginScreen 
function LoginScreen({ onLogin, onBackToWelcome }) {
  const [password, setPassword] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState(() => 
    [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 2,
      color: ['#d7ccc8', '#bcaaa4', '#a1887f', '#8d6e63'][Math.floor(Math.random() * 4)],
      opacity: 0.4 + Math.random() * 0.6
    }))
  );
  const { playClickSound, playKeyboardSound } = useSound();

  const handleSubmit = (e) => {
    e.preventDefault();
    playClickSound();
    if (password === 'zozo123') {
      setIsLoading(true);
      setTimeout(() => {
        onLogin();
      }, 1500);
    } else {
      setError('Incorrect password. Try again.');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleBackClick = () => {
    playClickSound();
    onBackToWelcome();
  };

  const handleHintToggle = () => {
    playClickSound();
    setShowHint(!showHint);
  };

  const handleForgotPasswordClick = () => {
    playClickSound();
    const popupWidth = 256; 
    const popupHeight = 200; 
    const centerX = (window.innerWidth - popupWidth) / 2;
    const centerY = (window.innerHeight - popupHeight) / 2;
    setPopupPosition({ x: centerX, y: centerY });
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    playClickSound();
    setShowForgotPassword(false);
    setIsDragging(false);
  };

  const handlePopupMouseDown = (e) => {
    if (e.target.closest('.popup-close-button')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - popupPosition.x,
      y: e.clientY - popupPosition.y
    });
  };

  // drag handling
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const popupWidth = 256; 
        const popupHeight = 200; 
        const padding = 10;
        
        const newX = Math.max(padding, Math.min(window.innerWidth - popupWidth - padding, e.clientX - dragOffset.x));
        const newY = Math.max(padding, Math.min(window.innerHeight - popupHeight - padding, e.clientY - dragOffset.y));
        
        setPopupPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'move';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, dragOffset, popupPosition]);

  const handleInputChange = (e) => {
    setPassword(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!e.ctrlKey && !e.altKey && !e.metaKey) {
      playKeyboardSound();
    }
  };

  if (isLoading) {
    return (
      <div 
        className="h-screen w-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-amber-100 text-xl mb-8 font-mono">AUTUMN OS LOADING...</div>
          <div className="w-96 h-6 bg-amber-900 border-2" style={{ 
            borderColor: '#d7ccc8 #3e2723 #3e2723 #d7ccc8',
            borderStyle: 'solid'
          }}>
            <div className="h-full bg-gradient-to-r from-orange-400 to-amber-300 animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <div className="text-amber-200 text-sm mt-6 font-mono">Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center"
      style={{
       background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
      }}
    >
      {/* bg */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              background: particle.color,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>

      {/* login window */}
      <div 
        className="w-96 border-4 shadow-2xl relative"
        style={{
          background: 'linear-gradient(145deg, #d7ccc8, #bcaaa4)',
          borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
          borderStyle: 'solid',
          fontFamily: 'Courier New, monospace'
        }}
      >
        {/* title bar */}
        <div 
          className="px-4 py-3 text-sm flex items-center justify-between font-bold"
          style={{
            background: 'linear-gradient(90deg, #8d6e63 0%, #6d4c41 50%, #5d4037 100%)',
            color: '#efebe9'
          }}
        >
          <span>AUTUMN OS - USER LOGIN</span>
          <button 
          className="w-5 h-5 border-2 text-xs flex items-center justify-center font-bold"
          onClick={handleBackClick}
          style={{ 
            borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
            background: '#d7ccc8',
            color: '#3e2723'
            }}
          >
            X
          </button>
        </div>

        {/* login content */}
        <div className="p-10 space-y-8">
          {/* header text */}
          <div className="text-center">
            <div className="font-bold text-lg font-mono mb-3" style={{ color: '#3e2723' }}>SECURE ACCESS</div>
            <div className="text-sm font-mono" style={{ color: '#5d4037' }}>Enter credentials to continue</div>
          </div>

          {/* profile section */}
          <div className="flex items-center space-x-6 p-6 border-2" style={{
            background: 'linear-gradient(145deg, #efebe9, #d7ccc8)',
            borderColor: '#3e2723 #efebe9 #efebe9 #3e2723'
          }}>
            <img 
              src="./caelus.jpg"
              alt="Profile"
              className="w-16 h-16 rounded-full border-3 object-cover"
              style={{ 
                borderColor: '#3e2723'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            {/* fallback profile icon */}
            <div 
              className="w-16 h-16 rounded-full border-3 items-center justify-center text-white font-bold text-xl hidden"
              style={{ 
                background: 'linear-gradient(135deg, #6d4c41, #4e342e)',
                borderColor: '#3e2723'
              }}
            >
              U
            </div>
            <div className="space-y-1">
              <div className="font-bold text-base font-mono" style={{ color: '#3e2723' }}>ZOZO</div>
              <div className="text-sm font-mono" style={{ color: '#5d4037' }}>Administrator</div>
            </div>
          </div>

          {/* password section */}
          <div className="space-y-4">
            <div className="text-sm font-mono font-bold mb-3" style={{ color: '#3e2723' }}>PASSWORD:</div>
            <input
              type="password"
              value={password}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              onKeyDown={handleKeyDown}
              className="w-full p-4 border-2 text-base font-mono"
              style={{
                borderColor: '#3e2723 #efebe9 #efebe9 #3e2723',
                borderStyle: 'solid',
                background: '#efebe9',
                color: '#3e2723'
              }}
              placeholder="Enter password..."
              autoFocus
            />
            
            {/* pptions */}
            <div className="flex items-center space-x-3 mt-5">
              <input 
                type="checkbox" 
                id="hint" 
                checked={showHint}
                onChange={handleHintToggle}
                className="w-4 h-4"
              />
              <label htmlFor="hint" className="text-sm cursor-pointer font-mono" style={{ color: '#3e2723' }}>
                Show password hint
              </label>
            </div>
          </div>

          {/* error message  */}
          {error && (
            <div 
              className="p-4 border-2 text-sm font-mono"
              style={{ 
                borderColor: '#3e2723 #efebe9 #efebe9 #3e2723',
                background: '#ffcdd2',
                color: '#c62828'
              }}
            >
              ERROR: {error}
            </div>
          )}

          {/* hint display  */}
          {showHint && (
            <div 
              className="p-4 border-2 text-sm font-mono"
              style={{ 
                borderColor: '#3e2723 #efebe9 #efebe9 #3e2723',
                background: '#fff3e0',
                color: '#e65100'
              }}
            >
              <div className="font-bold mb-3" style={{ color: '#3e2723' }}>PASSWORD HINT:</div>
              <div>Owner's nickname + 123</div>
            </div>
          )}

          {/* buttons */}
          <div className="flex space-x-6 justify-center pt-6">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 border-2 text-sm font-bold font-mono"
              style={{
                background: 'linear-gradient(145deg, #8d6e63, #6d4c41)',
                borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
                color: '#efebe9'
              }}
              onMouseDown={(e) => {
                e.target.style.borderColor = '#3e2723 #efebe9 #efebe9 #3e2723';
              }}
              onMouseUp={(e) => {
                e.target.style.borderColor = '#efebe9 #3e2723 #3e2723 #efebe9';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#efebe9 #3e2723 #3e2723 #efebe9';
              }}
            >
              LOGIN
            </button>
            <button
            onClick={handleBackClick}
            className="px-8 py-3 border-2 text-sm font-bold font-mono"
            style={{
              background: 'linear-gradient(145deg, #bcaaa4, #a1887f)',
              borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
              color: '#3e2723'
              }}
            >
              CANCEL
            </button>
          </div>

          {/* bottom section*/}
          <div className="border-t-2 pt-6 mt-8" style={{ borderColor: '#3e2723' }}>
            <div className="flex justify-between text-xs font-mono">
              <button 
                className="underline" 
                style={{ color: '#5d4037' }}
                onClick={handleForgotPasswordClick}
              >
                FORGOT PASSWORD?
              </button>
              <button className="underline" style={{ color: '#5d4037' }}>SHUTDOWN SYSTEM</button>
            </div>
          </div>

          {/* system info */}
          <div className="text-center text-xs font-mono mt-6" style={{ color: '#6d4c41' }}>
            AUTUMN OS v2.1 - SEPTEMBER EDITION
          </div>
        </div>
      </div>

      {/* forgot password popup  */}
      {showForgotPassword && (
        <div 
          className="fixed w-64 border-4 shadow-2xl z-50 select-none"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
            background: 'linear-gradient(145deg, #d7ccc8, #bcaaa4)',
            borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
            borderStyle: 'solid',
            fontFamily: 'Courier New, monospace',
            cursor: isDragging ? 'move' : 'default'
          }}
        >
          {/* popup title bar  */}
          <div 
            className="px-3 py-2 text-xs flex items-center justify-between font-bold cursor-move"
            style={{
              background: 'linear-gradient(90deg, #8d6e63 0%, #6d4c41 50%, #5d4037 100%)',
              color: '#efebe9'
            }}
            onMouseDown={handlePopupMouseDown}
          >
            <span>PASSWORD RECOVERY</span>
            <button 
              className="popup-close-button w-4 h-4 border-2 text-xs flex items-center justify-center font-bold cursor-pointer"
              onClick={handleCloseForgotPassword}
              style={{ 
                borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
                background: '#d7ccc8',
                color: '#3e2723',
                fontSize: '10px'
              }}
            >
              X
            </button>
          </div>

          {/* popup content */}
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div 
                className="text-sm font-mono mb-3"
                style={{ color: '#3e2723' }}
              >
                gah fine fine, heres the password:
              </div>
              <div 
                className="text-base font-bold font-mono p-2 border-2 bg-amber-100"
                style={{ 
                  borderColor: '#3e2723 #efebe9 #efebe9 #3e2723',
                  color: '#3e2723'
                }}
              >
                zozo123
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCloseForgotPassword}
                className="px-4 py-2 border-2 text-xs font-bold font-mono"
                style={{
                  background: 'linear-gradient(145deg, #8d6e63, #6d4c41)',
                  borderColor: '#efebe9 #3e2723 #3e2723 #efebe9',
                  color: '#efebe9'
                }}
                onMouseDown={(e) => {
                  e.target.style.borderColor = '#3e2723 #efebe9 #efebe9 #3e2723';
                }}
                onMouseUp={(e) => {
                  e.target.style.borderColor = '#efebe9 #3e2723 #3e2723 #efebe9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#efebe9 #3e2723 #3e2723 #efebe9';
                }}
              >
                tysm zochan!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//  specifixc window bgs
const getAppBackground = (appId) => {
  const backgrounds = {
    'calc': 'linear-gradient(145deg, #f7f0e8, #e8dcc6)',
    'music': 'linear-gradient(135deg, #8B4513 0%, #CD853F 50%, #DEB887 100%)',
    'weather': 'linear-gradient(90deg, #C8986F 100%, #C8986F 50%, #C8986F 100%)',
    'tic': 'linear-gradient(135deg, #f4f1e8 0%, #e8dcc6 100%)',
    'notes': 'linear-gradient(135deg, #f4f1e8 0%, #fed7aa 100%)',
    'leaves': 'linear-gradient(135deg, #fef7cd 0%, #fed7aa 100%)',
    'search': '#1a0f0a',
    'poetry': `
      linear-gradient(135deg, #f4f1e8 0%, #e8dcc6 100%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,.05) 2px,
        rgba(0,0,0,.05) 4px
      )
    `, 
    'memory': 'linear-gradient(135deg, #7c2d12 0%, #92400e 50%, #dc2626 100%)',
    'snake': 'linear-gradient(135deg, #f4f1e8 0%, #e8dcc6 100%)',
    'paint': 'linear-gradient(135deg, #f4f1e8 0%, #e8dcc6 100%)' // ADD THIS LINE
  };
  
  return backgrounds[appId] || '#f5f5dc';
};

// window comp
function Window({ 
  id, 
  title, 
  children, 
  onClose, 
  onMinimize, 
  onFullscreen, 
  onFocus,
  position,
  size,
  isActive,
  isMinimized,
  isFullscreen,
  onPositionChange,
  onSizeChange 
}) {
  const windowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { playClickSound } = useSound();
  
  // original app size from appsList
  const appsList = [
    { id: "calc", size: { width: 280, height: 430 } },
    { id: "music", size: { width: 400, height: 520 } },
    { id: "weather", size: { width: 520, height: 500 } },
    { id: "tic", size: { width: 350, height: 465 } },
    { id: "notes", size: { width: 620, height: 470 } },
    { id: "leaves", size: { width: 400, height: 450 } },
    { id: "search", size: { width: 500, height: 600 } },
    { id: "poetry", size: { width: 400, height: 480 } },
    { id: "memory", size: { width: 390, height: 550 } },
    { id: "snake", size: { width: 450, height: 500 } },
    { id: "paint", size: { width: 900, height: 700 } },
  ];
  
  const originalSize = appsList.find(app => app.id === id)?.size || { width: 600, height: 450 };

  // apps that should fill the window completely vs maintain aspect ratio
  const responsiveApps = ['folder', 'images']; 
  const fixedLayoutApps = ['search', 'notes'];
  const shouldStretch = isFullscreen && responsiveApps.includes(id);
  
  const contentWidth = size.width;
  const contentHeight = size.height - 32; 
  
  const scaleX = contentWidth / originalSize.width;
  const scaleY = contentHeight / originalSize.height;
  
  const scale = (shouldStretch || responsiveApps.includes(id)) ? 1 : Math.min(scaleX, scaleY);

  const titleBarScale = Math.max(0.7, Math.min(1.2, Math.min(scaleX, scaleY)));
  const titleBarHeight = Math.max(24, Math.min(40, 32 * titleBarScale));
  const buttonSize = Math.max(18, Math.min(30, 24 * titleBarScale));
  const fontSize = Math.max(10, Math.min(16, 14 * titleBarScale));

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.resize-handle')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onFocus();
  };

  const handleResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    onFocus();
  };

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  const handleMinimize = () => {
    playClickSound();
    onMinimize();
  };

  const handleFullscreen = () => {
    playClickSound();
    onFullscreen();
  };

  const handleFocus = () => {
    playClickSound();
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isFullscreen) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - size.height - 48, e.clientY - dragOffset.y));
        onPositionChange({
          x: newX,
          y: newY
        });
      } else if (isResizing && !isFullscreen) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = position.x;
        let newY = position.y;

        // screen boundaries 
        const screenPadding = 10;
        const taskbarHeight = 48;
        const maxScreenWidth = window.innerWidth - screenPadding;
        const maxScreenHeight = window.innerHeight - taskbarHeight - screenPadding;

        if (responsiveApps.includes(id)) {
          // minimum sizes
          const minWidth = 300;
          const minHeight = 200;
        //max size calculation
          const maxWidthFromPosition = maxScreenWidth - position.x;
          const maxHeightFromPosition = maxScreenHeight - position.y;

          switch (resizeDirection) {
            case 'se':
              newWidth = Math.max(minWidth, Math.min(maxWidthFromPosition, resizeStart.width + deltaX));
              newHeight = Math.max(minHeight, Math.min(maxHeightFromPosition, resizeStart.height + deltaY));
              break;
              
            case 'sw':
              const proposedWidthSW = Math.max(minWidth, resizeStart.width - deltaX);
              const minXPosition = screenPadding;
              const maxWidthFromLeftSW = (position.x + resizeStart.width) - minXPosition;
              
              newWidth = Math.min(proposedWidthSW, maxWidthFromLeftSW);
              newHeight = Math.max(minHeight, Math.min(maxHeightFromPosition, resizeStart.height + deltaY));
              
              const widthDeltaSW = resizeStart.width - newWidth;
              newX = Math.max(minXPosition, position.x + widthDeltaSW);
              break;
              
            case 'ne':
              newWidth = Math.max(minWidth, Math.min(maxWidthFromPosition, resizeStart.width + deltaX));
              
              const proposedHeightNE = Math.max(minHeight, resizeStart.height - deltaY);
              const minYPosition = screenPadding;
              const maxHeightFromTopNE = (position.y + resizeStart.height) - minYPosition;
              
              newHeight = Math.min(proposedHeightNE, maxHeightFromTopNE);
              
              const heightDeltaNE = resizeStart.height - newHeight;
              newY = Math.max(minYPosition, position.y + heightDeltaNE);
              break;
              
            case 'nw':
              const proposedWidthNW = Math.max(minWidth, resizeStart.width - deltaX);
              const minXPositionNW = screenPadding;
              const maxWidthFromLeftNW = (position.x + resizeStart.width) - minXPositionNW;
              
              newWidth = Math.min(proposedWidthNW, maxWidthFromLeftNW);
            
              const proposedHeightNW = Math.max(minHeight, resizeStart.height - deltaY);
              const minYPositionNW = screenPadding;
              const maxHeightFromTopNW = (position.y + resizeStart.height) - minYPositionNW;
              
              newHeight = Math.min(proposedHeightNW, maxHeightFromTopNW);
            
              const widthDeltaNW = resizeStart.width - newWidth;
              const heightDeltaNW = resizeStart.height - newHeight;
              newX = Math.max(minXPositionNW, position.x + widthDeltaNW);
              newY = Math.max(minYPositionNW, position.y + heightDeltaNW);
              break;
              
            case 'n':
              const proposedHeightN = Math.max(minHeight, resizeStart.height - deltaY);
              const minYPositionN = screenPadding;
              const maxHeightFromTopN = (position.y + resizeStart.height) - minYPositionN;
              
              newHeight = Math.min(proposedHeightN, maxHeightFromTopN);
        
              const heightDeltaN = resizeStart.height - newHeight;
              newY = Math.max(minYPositionN, position.y + heightDeltaN);
              break;
              
            case 's':
              newHeight = Math.max(minHeight, Math.min(maxHeightFromPosition, resizeStart.height + deltaY));
              break;
              
            case 'e':
              newWidth = Math.max(minWidth, Math.min(maxWidthFromPosition, resizeStart.width + deltaX));
              break;
              
            case 'w':
              const proposedWidthW = Math.max(minWidth, resizeStart.width - deltaX);
              const minXPositionW = screenPadding;
              const maxWidthFromLeftW = (position.x + resizeStart.width) - minXPositionW;
              
              newWidth = Math.min(proposedWidthW, maxWidthFromLeftW);
              
              const widthDeltaW = resizeStart.width - newWidth;
              newX = Math.max(minXPositionW, position.x + widthDeltaW);
              break;
          }
          
          if (newX + newWidth > maxScreenWidth) {
            if (resizeDirection.includes('e')) {
              newWidth = maxScreenWidth - newX;
            } else {
              newX = maxScreenWidth - newWidth;
            }
          }
          
          if (newY + newHeight > maxScreenHeight) {
            if (resizeDirection.includes('s')) {
              newHeight = maxScreenHeight - newY;
            } else {
              newY = maxScreenHeight - newHeight;
            }
          }
          
          newX = Math.max(screenPadding, newX);
          newY = Math.max(screenPadding, newY);
        } else if (fixedLayoutApps.includes(id)) {
          // set minimum sizes based on original app dimensions to preserve layout
          const minWidth = originalSize.width * 0.8; // no more below 80% of original width
          const minHeight = originalSize.height * 0.8; // same here w height
          
          // set maximum sizes
          const maxWidth = Math.min(originalSize.width * 2, maxScreenWidth - position.x);
          const maxHeight = Math.min(originalSize.height * 2, maxScreenHeight - position.y);

          switch (resizeDirection) {
            case 'se':
              newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
              newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
              break;
              
            case 'sw':
              const proposedWidthSW = Math.max(minWidth, resizeStart.width - deltaX);
              const minXPosition = screenPadding;
              const maxWidthFromLeftSW = (position.x + resizeStart.width) - minXPosition;
              
              newWidth = Math.min(proposedWidthSW, maxWidthFromLeftSW);
              newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
              
              const widthDeltaSW = resizeStart.width - newWidth;
              newX = Math.max(minXPosition, position.x + widthDeltaSW);
              break;
              
            case 'ne':
              newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
              
              const proposedHeightNE = Math.max(minHeight, resizeStart.height - deltaY);
              const minYPosition = screenPadding;
              const maxHeightFromTopNE = (position.y + resizeStart.height) - minYPosition;
              
              newHeight = Math.min(proposedHeightNE, maxHeightFromTopNE);
              
              const heightDeltaNE = resizeStart.height - newHeight;
              newY = Math.max(minYPosition, position.y + heightDeltaNE);
              break;
              
            case 'nw':
              const proposedWidthNW = Math.max(minWidth, resizeStart.width - deltaX);
              const minXPositionNW = screenPadding;
              const maxWidthFromLeftNW = (position.x + resizeStart.width) - minXPositionNW;
              
              newWidth = Math.min(proposedWidthNW, maxWidthFromLeftNW);
              
              const proposedHeightNW = Math.max(minHeight, resizeStart.height - deltaY);
              const minYPositionNW = screenPadding;
              const maxHeightFromTopNW = (position.y + resizeStart.height) - minYPositionNW;
              
              newHeight = Math.min(proposedHeightNW, maxHeightFromTopNW);
              
              const widthDeltaNW = resizeStart.width - newWidth;
              const heightDeltaNW = resizeStart.height - newHeight;
              newX = Math.max(minXPositionNW, position.x + widthDeltaNW);
              newY = Math.max(minYPositionNW, position.y + heightDeltaNW);
              break;
              
            case 'n':
              const proposedHeightN = Math.max(minHeight, resizeStart.height - deltaY);
              const minYPositionN = screenPadding;
              const maxHeightFromTopN = (position.y + resizeStart.height) - minYPositionN;
              
              newHeight = Math.min(proposedHeightN, maxHeightFromTopN);
              
              const heightDeltaN = resizeStart.height - newHeight;
              newY = Math.max(minYPositionN, position.y + heightDeltaN);
              break;
              
            case 's':
              newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
              break;
              
            case 'e':
              newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
              break;
              
            case 'w':
              const proposedWidthW = Math.max(minWidth, resizeStart.width - deltaX);
              const minXPositionW = screenPadding;
              const maxWidthFromLeftW = (position.x + resizeStart.width) - minXPositionW;
              
              newWidth = Math.min(proposedWidthW, maxWidthFromLeftW);
              
              const widthDeltaW = resizeStart.width - newWidth;
              newX = Math.max(minXPositionW, position.x + widthDeltaW);
              break;
          }
       
          if (newX + newWidth > maxScreenWidth) {
            if (resizeDirection.includes('e')) {
              newWidth = Math.max(minWidth, maxScreenWidth - newX);
            } else {
              newX = Math.max(screenPadding, maxScreenWidth - newWidth);
            }
          }
          
          if (newY + newHeight > maxScreenHeight) {
            if (resizeDirection.includes('s')) {
              newHeight = Math.max(minHeight, maxScreenHeight - newY);
            } else {
              newY = Math.max(screenPadding, maxScreenHeight - newHeight);
            }
          }
          
          newX = Math.max(screenPadding, newX);
          newY = Math.max(screenPadding, newY);
        } else {
          const aspectRatio = originalSize.width / originalSize.height;
          
          // set minimum and maximum sizes
          const minWidth = originalSize.width * 0.5;
          const minHeight = originalSize.height * 0.5;
          const maxWidth = Math.min(originalSize.width * 2, maxScreenWidth - position.x);
          const maxHeight = Math.min(originalSize.height * 2, maxScreenHeight - position.y);

          switch (resizeDirection) {
            case 'se':
              let tempWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
              let tempHeight = tempWidth / aspectRatio;
              
              if (tempHeight > maxHeight || tempHeight < minHeight) {
                tempHeight = Math.max(minHeight, Math.min(maxHeight, tempHeight));
                tempWidth = tempHeight * aspectRatio;
              }
              
              newWidth = tempWidth;
              newHeight = tempHeight;
              break;
              
            case 'sw':
              let tempWidthSW = Math.max(minWidth, resizeStart.width - deltaX);
              let tempHeightSW = tempWidthSW / aspectRatio;
              
              const newXSW = position.x + (resizeStart.width - tempWidthSW);
              if (newXSW < screenPadding) {
                tempWidthSW = resizeStart.width + position.x - screenPadding;
                tempHeightSW = tempWidthSW / aspectRatio;
              }
              
              const maxHeightSW = maxScreenHeight - position.y;
              if (tempHeightSW > maxHeightSW) {
                tempHeightSW = maxHeightSW;
                tempWidthSW = tempHeightSW * aspectRatio;
              }
              
              newWidth = tempWidthSW;
              newHeight = tempHeightSW;
              newX = Math.max(screenPadding, position.x + (resizeStart.width - tempWidthSW));
              break;
              
            case 'ne':
              let tempWidthNE = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
              let tempHeightNE = tempWidthNE / aspectRatio;
              
              const newYNE = position.y + (resizeStart.height - tempHeightNE);
              if (newYNE < screenPadding) {
                tempHeightNE = resizeStart.height + position.y - screenPadding;
                tempWidthNE = tempHeightNE * aspectRatio;
              }
              
              newWidth = tempWidthNE;
              newHeight = tempHeightNE;
              newY = Math.max(screenPadding, position.y + (resizeStart.height - tempHeightNE));
              break;
              
            case 'nw':
              let tempWidthNW = Math.max(minWidth, resizeStart.width - deltaX);
              let tempHeightNW = tempWidthNW / aspectRatio;
              
              // check boundaries for both X and Y
              const newXNW = position.x + (resizeStart.width - tempWidthNW);
              const newYNW = position.y + (resizeStart.height - tempHeightNW);
              
              if (newXNW < screenPadding) {
                tempWidthNW = resizeStart.width + position.x - screenPadding;
                tempHeightNW = tempWidthNW / aspectRatio;
              }
              
              if (newYNW < screenPadding) {
                tempHeightNW = resizeStart.height + position.y - screenPadding;
                tempWidthNW = tempHeightNW * aspectRatio;
              }
              
              newWidth = tempWidthNW;
              newHeight = tempHeightNW;
              newX = Math.max(screenPadding, position.x + (resizeStart.width - tempWidthNW));
              newY = Math.max(screenPadding, position.y + (resizeStart.height - tempHeightNW));
              break;
              
            case 'n':
            case 's':
              if (resizeDirection === 'n') {
                let tempHeightN = Math.max(minHeight, resizeStart.height - deltaY);
                const newYN = position.y + (resizeStart.height - tempHeightN);
                
                if (newYN < screenPadding) {
                  tempHeightN = resizeStart.height + position.y - screenPadding;
                }
                
                newHeight = tempHeightN;
                newY = Math.max(screenPadding, position.y + (resizeStart.height - tempHeightN));
              } else {
                newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
              }
              
              newWidth = newHeight * aspectRatio;
              
              // ensure width fits on screen
              if (newWidth > maxWidth) {
                newWidth = maxWidth;
                newHeight = newWidth / aspectRatio;
              }
              break;
              
            case 'e':
            case 'w':
              if (resizeDirection === 'w') {
                let tempWidthW = Math.max(minWidth, resizeStart.width - deltaX);
                const newXW = position.x + (resizeStart.width - tempWidthW);
                
                if (newXW < screenPadding) {
                  tempWidthW = resizeStart.width + position.x - screenPadding;
                }
                
                newWidth = tempWidthW;
                newX = Math.max(screenPadding, position.x + (resizeStart.width - tempWidthW));
              } else {
                newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
              }
              
              newHeight = newWidth / aspectRatio;
              
              // ensure height fits on screen
              if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = newHeight * aspectRatio;
              }
              break;
          }
        }

        // ensure window stays on screen
        if (newX + newWidth > maxScreenWidth) {
          newX = maxScreenWidth - newWidth;
        }
        if (newY + newHeight > maxScreenHeight) {
          newY = maxScreenHeight - newHeight;
        }
        
        newX = Math.max(screenPadding, newX);
        newY = Math.max(screenPadding, newY);

        onSizeChange({ width: Math.round(newWidth), height: Math.round(newHeight) });
        if (newX !== position.x || newY !== position.y) {
          onPositionChange({ x: Math.round(newX), y: Math.round(newY) });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing ? getCursor(resizeDirection) : 'move';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, isResizing, dragOffset, isFullscreen, onPositionChange, size, position, resizeStart, resizeDirection, originalSize, id]);

  const getCursor = (direction) => {
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nw-resize';
      default:
        return 'default';
    }
  };

  if (isMinimized) return null;

  const windowStyle = isFullscreen
    ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 48px)' }
    : {
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height
      };

  return (
    <div
      ref={windowRef}
      className={`absolute border-4 shadow-2xl window-container ${
        isActive ? 'z-50' : 'z-10'
      } ${
        isResizing ? 'window-resizing' : 'window-smooth-transition'
      }`}
      style={{
        ...windowStyle,
        background: 'linear-gradient(145deg, #f5deb3, #deb887)',
        borderColor: isActive 
          ? '#f5deb3 #8b4513 #8b4513 #f5deb3'
          : '#deb887 #654321 #654321 #deb887',
        borderStyle: 'solid',
        boxShadow: isActive 
          ? '4px 4px 8px rgba(0, 0, 0, 0.3)'
          : '2px 2px 4px rgba(0, 0, 0, 0.2)',
        fontFamily: 'Courier New, monospace'
      }}
      onClick={handleFocus}
    >
      {/* title bar*/}
      <div
        className={`flex items-center justify-between px-3 py-2 cursor-move text-amber-900 font-bold`}
        onMouseDown={handleMouseDown}
        style={{ 
          background: isActive 
            ? 'linear-gradient(90deg, #daa520 0%, #b8860b 50%, #cd853f 100%)'
            : 'linear-gradient(90deg, #cd853f 0%, #a0522d 50%, #8b4513 100%)',
          height: `${titleBarHeight}px`,
          minHeight: `${titleBarHeight}px`,
          borderBottom: '2px solid',
          borderColor: isActive ? '#8b4513' : '#654321',
          fontSize: `${fontSize}px`
        }}
      >
        <div className="flex items-center space-x-2">
          <span style={{ fontSize: `${Math.max(12, fontSize + 2)}px` }}>🍂</span>
          <span>{title}</span>
        </div>
        <div className="window-controls flex space-x-1">
          <button
            onClick={handleMinimize}
            className="border-2 hover:bg-amber-300 flex items-center justify-center font-bold"
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              background: 'linear-gradient(145deg, #f5deb3, #deb887)',
              borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
              color: '#8b4513',
              fontSize: `${Math.max(8, fontSize - 2)}px`
            }}
          >
            _
          </button>
          <button
            onClick={handleFullscreen}
            className="border-2 hover:bg-amber-300 flex items-center justify-center font-bold"
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              background: 'linear-gradient(145deg, #f5deb3, #deb887)',
              borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
              color: '#8b4513',
              fontSize: `${Math.max(8, fontSize - 2)}px`
            }}
          >
            ▢
          </button>
          <button
            onClick={handleClose}
            className="border-2 hover:bg-red-300 flex items-center justify-center font-bold"
            style={{
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              background: 'linear-gradient(145deg, #f5deb3, #deb887)',
              borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
              color: '#8b4513',
              fontSize: `${Math.max(8, fontSize - 2)}px`
            }}
          >
            X
          </button>
        </div>
      </div>
      
      {/*window content container */}
      <div 
        className={`relative overflow-hidden app-content-smooth`}
        style={{ 
          height: `calc(100% - ${titleBarHeight}px)`,
          width: '100%',
          background: getAppBackground(id),
          ...(id.startsWith('txt-') || id.startsWith('zozo-txt-') || id.startsWith('img-') ? 
            {
              display: 'block',
              position: 'relative'
            } : 
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          )
        }}
      >
        <div
          style={{
            ...(id.startsWith('txt-') || id.startsWith('zozo-txt-') || id.startsWith('img-') ? 
              {
                width: '100%',
                height: '100%',
                position: 'static',
                transform: 'none',
                overflow: 'hidden'
              } : 
              responsiveApps.includes(id) ? 
              {
                width: '100%',
                height: '100%',
                transform: 'none',
                transformOrigin: 'center center',
                overflow: 'hidden',
                flexShrink: 0
              } :
              fixedLayoutApps.includes(id) ?
              {
                width: '100%',
                height: '100%',
                transform: 'none',
                transformOrigin: 'center center',
                overflow: 'auto',
                flexShrink: 0
              } : 
              {
                width: originalSize.width,
                height: originalSize.height,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                overflow: 'visible',
                flexShrink: 0
              }
            )
          }}
        >
          {children}
        </div>
      </div>

      {/* resize handlers */}
      {!isFullscreen && (
        <>
          <div 
            className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div 
            className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            style={{ transform: 'translate(50%, -50%)' }}
          />
          <div 
            className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            style={{ transform: 'translate(-50%, 50%)' }}
          />
          <div 
            className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            style={{ transform: 'translate(50%, 50%)' }}
          />
          
          <div 
            className="resize-handle absolute top-0 left-3 right-3 h-2 cursor-n-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            style={{ transform: 'translateY(-50%)' }}
          />
          <div 
            className="resize-handle absolute bottom-0 left-3 right-3 h-2 cursor-s-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            style={{ transform: 'translateY(50%)' }}
          />
          <div 
            className="resize-handle absolute left-0 top-3 bottom-3 w-2 cursor-w-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            style={{ transform: 'translateX(-50%)' }}
          />
          <div 
            className="resize-handle absolute right-0 top-3 bottom-3 w-2 cursor-e-resize bg-transparent"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            style={{ transform: 'translateX(50%)' }}
          />
        </>
      )}
    </div>
  );
}

// desktop comp
function Desktop({ apps, onOpenApp }) {
  const handleDoubleClick = (app) => {
    onOpenApp(app);
  };

  const handlePetClick = () => {
    console.log("haku clicked!");
  };

  return (
    <div 
      className="h-full w-full relative overflow-hidden"
      style={{
        backgroundImage: `url('./assets/kohaku.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        background: `
          url('./assets/desktop12.jpg') center/cover no-repeat,
          linear-gradient(135deg, 
            #FEF7ED 0%, 
            #FED7AA 25%, 
            #FDBA74 50%, 
            #FB923C 75%, 
            #F97316 100%
          )
        `
      }}
    >
      {/* desktop icons */}
      <div className="absolute top-6 left-6 flex gap-6">
        {/* 1st column - 8 apps */}
        <div className="flex flex-col gap-1">
          {apps.slice(0, 8).map(app => (
            <DesktopIcon
              key={app.id}
              app={app}
              onDoubleClick={handleDoubleClick}
            />
          ))}
        </div>
        
        {/* 2nd column - remaining apps */}
        <div className="flex flex-col gap-1">
          {apps.slice(8).map(app => (
            <DesktopIcon
              key={app.id}
              app={app}
              onDoubleClick={handleDoubleClick}
            />
          ))}
        </div>
      </div>

      {/* widgets*/}
      <DraggableWidget widgetId="clock" initialPosition={{ x: window.innerWidth - 220, y: 20 }}>
        <ClockWidget />
      </DraggableWidget>

      <DraggableWidget widgetId="calendar" initialPosition={{ x: window.innerWidth - 220, y: 140 }}>
        <CalendarWidget />
      </DraggableWidget>

      <DraggableWidget widgetId="tasks" initialPosition={{ x: window.innerWidth - 450, y: 20 }}>
        <TaskListWidget />
      </DraggableWidget>

      <DraggableWidget widgetId="goals" initialPosition={{ x: 620, y: 50 }}>
        <FocusGoalsWidget />
      </DraggableWidget>

      {/* petto*/}
      <VirtualPet onPetClick={handlePetClick} />
    </div>
  );
}

// desktop icon component
function DesktopIcon({ app, onDoubleClick }) {
  return (
    <div
      className="flex flex-col items-center p-3 m-2 w-20 cursor-pointer hover:bg-amber-200 hover:bg-opacity-40 rounded-lg transition-all duration-200"
      onDoubleClick={() => onDoubleClick(app)}
    >
      <img 
        src={app.icon} 
        alt={app.name}
        className="w-9 h-9 mb-2 filter drop-shadow-sm object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
      <span className="text-amber-900 text-xs text-center font-medium" style={{ fontFamily: 'serif' }}>
        {app.name}
      </span>
    </div>
  );
}

// start Menu component
function StartMenu({ apps, isOpen, onOpenApp, onClose }) {
  const { playClickSound } = useSound();

  if (!isOpen) return null;

  const handleAppClick = (app) => {
    playClickSound();
    onOpenApp(app);
    onClose();
  };

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  return (
    <div className="absolute bottom-12 left-3 w-80 border-4 shadow-2xl z-50 overflow-hidden"
         style={{
           background: 'linear-gradient(145deg, #f5deb3, #deb887)',
           borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
           borderStyle: 'solid',
           fontFamily: 'monospace'
         }}>
      <div className="text-amber-900 p-4 text-sm font-bold flex items-center border-b-2"
           style={{ 
             background: 'linear-gradient(90deg, #daa520 0%, #b8860b 50%, #cd853f 100%)',
             borderColor: '#8b4513'
           }}>
        <span className="text-lg mr-3">🍂</span>
        <span>Applications</span>
        <button 
          className="ml-auto w-5 h-5 border-2 text-xs flex items-center justify-center font-bold"
          onClick={handleClose}
          style={{ 
            borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
            background: '#f5deb3',
            color: '#8b4513'
          }}
        >
          X
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {apps.map(app => (
          <div
            key={app.id}
            className="flex items-center p-3 cursor-pointer border-b transition-colors duration-150"
            style={{
              borderColor: '#cd853f',
              paddingLeft: '12px' 
            }}
            onClick={() => handleAppClick(app)}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(90deg, #deb887, #cd853f)';
              e.target.style.borderRadius = '4px';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderRadius = '0px';
            }}
          >
            <img 
              src={app.icon} 
              alt={app.name}
              className="w-6 h-6 mr-4 filter drop-shadow-sm object-contain"
              style={{ 
                imageRendering: 'pixelated'
              }}
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-amber-900">
                {app.name}
              </span>
            </div>
          </div>
        ))}
        
        {/* separator */}
        <div className="border-t-2 my-2 mx-3" style={{ borderColor: '#8b4513' }}></div>
        
        {/* system options */}
        <div className="p-3 text-xs text-amber-700 mx-3"
             style={{ 
               background: 'linear-gradient(90deg, #f5deb3, #deb887)',
               borderRadius: '4px',
               marginBottom: '8px'
             }}>
          <div className="flex items-center space-x-3 pl-1">
            <span>🌡️</span>
            <span style={{ fontFamily: 'monospace' }}>Autumn Mode Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// taskbar component 
function Taskbar({ openWindows, onToggleWindow, onOpenStartMenu, isStartMenuOpen, onCloseWindow, appsList, onOpenWiFi }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, windowId: null });
  const { playClickSound } = useSound();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  //  right-click context menu
  const handleRightClick = (e, windowId) => {
    e.preventDefault();
    playClickSound();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      windowId: windowId
    });
  };

  // close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, windowId: null });
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show]);

  //  get app icon by window ID
  const getAppIcon = (windowId) => {
  const app = appsList.find(app => app.id === windowId);
  return app ? (
    typeof app.icon === 'string' && (
      app.icon.includes('.png') || 
      app.icon.includes('.jpg') || 
      app.icon.includes('.jpeg') || 
      app.icon.includes('.gif') || 
      app.icon.includes('.svg')
    ) ? (
      <img 
        src={app.icon} 
        alt={app.name}
        className="w-4 h-4 object-contain"
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          // Fallback if image fails to load
          console.log(`Failed to load icon for ${app.name}: ${app.icon}`);
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
    ) : (
      // For emoji icons or fallback
      <span className="text-sm">{app.icon}</span>
    )
  ) : (
    <span className="text-sm">📱</span>
  );
};
  const handleStartMenuClick = () => {
    playClickSound();
    onOpenStartMenu(!isStartMenuOpen);
  };

  const handleWindowToggle = (windowId) => {
    playClickSound();
    onToggleWindow(windowId);
  };

  const handleContextMenuClose = (windowId) => {
    playClickSound();
    onCloseWindow(windowId);
    setContextMenu({ show: false, x: 0, y: 0, windowId: null });
  };

  const handleContextMenuToggle = (windowId) => {
    playClickSound();
    onToggleWindow(windowId);
    setContextMenu({ show: false, x: 0, y: 0, windowId: null });
  };

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 h-12 border-t-4 flex items-center justify-between px-3 z-40 shadow-lg"
      style={{
       background: 'linear-gradient(180deg, #deb887 0%, #cd853f 50%, #a0522d 100%)',
       borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
       borderStyle: 'solid',
       fontFamily: 'monospace',
       paddingLeft: '12px'
     }}>
        {/* start button */}
        <button
        className={`px-4 py-2 border-2 text-sm font-bold transition-all duration-200 flex items-center space-x-2 ${
          isStartMenuOpen 
          ? 'shadow-inner' 
          : 'shadow-md hover:shadow-lg'
        }`}
        onClick={handleStartMenuClick}
        style={{ 
          fontFamily: 'monospace',
          background: isStartMenuOpen 
          ? 'linear-gradient(145deg, #a0522d, #8b4513)'
          : 'linear-gradient(145deg, #f5deb3, #deb887)',
          borderColor: isStartMenuOpen
          ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
          : '#f5deb3 #8b4513 #8b4513 #f5deb3',
          color: isStartMenuOpen ? '#f5deb3' : '#8b4513'
        }}
        onMouseDown={(e) => {
          e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513';
        }}
        onMouseUp={(e) => {
          e.target.style.borderColor = isStartMenuOpen 
          ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
          : '#f5deb3 #8b4513 #8b4513 #f5deb3';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = isStartMenuOpen 
          ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
          : '#f5deb3 #8b4513 #8b4513 #f5deb3';
          }}
          >
        <span className="text-base">🍂</span>
        <span>Menu</span>
        </button>

        {/* open windows */}
        <div className="flex-1 flex items-center ml-4 gap-2 overflow-x-auto" style={{ paddingLeft: '8px' }}>
          {openWindows.map(window => {
            const appIcon = getAppIcon(window.id);
            return (
            <button
              key={window.id}
              className={`px-3 py-2 border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0`}
              onClick={() => handleWindowToggle(window.id)}
              onContextMenu={(e) => handleRightClick(e, window.id)}
              style={{ 
                fontFamily: 'monospace', 
                minWidth: '40px', 
                height: '32px',
                background: window.isActive
                ? 'linear-gradient(145deg, #a0522d, #8b4513)'
                : window.minimized
                ? 'linear-gradient(145deg, #cd853f, #a0522d)'
                : 'linear-gradient(145deg, #f5deb3, #deb887)',
                borderColor: window.isActive || window.minimized
                ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
                : '#f5deb3 #8b4513 #8b4513 #f5deb3',
                color: window.isActive ? '#f5deb3' : '#8b4513',
                boxShadow: window.isActive ? 'inset 1px 1px 2px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(0,0,0,0.1)'
              }}
              title={window.title}
              onMouseDown={(e) => {
                e.target.style.borderColor = '#8b4513 #f5deb3 #f5deb3 #8b4513';
              }}
              onMouseUp={(e) => {
                e.target.style.borderColor = window.isActive || window.minimized
                ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
                : '#f5deb3 #8b4513 #8b4513 #f5deb3';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = window.isActive || window.minimized
                ? '#8b4513 #f5deb3 #f5deb3 #8b4513'
                : '#f5deb3 #8b4513 #8b4513 #f5deb3';
                }}
                >
                  {appIcon}
                  </button>
            );
          })}
        </div>

        {/* system tray */}
        <div className="flex items-center space-x-3">
          {/* weather indicator */}
          <div className="text-lg">🌤️</div>
          
          {/* WiFi settings button */}
          <button
            className="p-1 hover:bg-amber-600 hover:bg-opacity-30 rounded transition-all duration-200"
            onClick={() => {
              playClickSound();
              onOpenWiFi();
            }}
            title="Quick Settings"
          >
            <div className="text-lg">📶</div>
          </button>
          
          {/* clock */}
          <div className="bg-gradient-to-b from-amber-100 to-orange-100 px-3 py-1 border-2 shadow-sm"
          style={{
             borderColor: '#f5deb3 #8b4513 #8b4513 #f5deb3',
             fontFamily: 'monospace'
             }}
          >
            <span className="text-xs font-medium text-amber-900">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {/* season indicator */}
          <div className="text-lg">🍃</div>
        </div>
      </div>

      {/* context menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-white border-2 border-amber-300 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 120),
            top: Math.max(contextMenu.y - 80, 10),
            minWidth: '120px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-100 flex items-center space-x-2"
            onClick={() => handleContextMenuClose(contextMenu.windowId)}
            style={{ fontFamily: 'serif' }}
          >
            <span>✖</span>
            <span>Close App</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-100 flex items-center space-x-2"
            onClick={() => handleContextMenuToggle(contextMenu.windowId)}
            style={{ fontFamily: 'serif' }}
          >
            <span>🗽</span>
            <span>Minimize</span>
          </button>
        </div>
      )}
    </>
  );
}

// main App comp
export default function RetroOS() {
  const [stage, setStage] = useState('loading'); 
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [isWiFiOpen, setIsWiFiOpen] = useState(false);
  
  //  state to track which windows are being closed
  const [closingWindows, setClosingWindows] = useState(new Set());

  const handleLoadingComplete = () => {
    setStage('welcome');
  };

  // preloading additional assets 
  const preloadMusicAssets = async () => {
    try {
      await globalAssetPreloader.preloadAssets(MUSIC_ASSETS);
    } catch (error) {
      console.warn('Failed to preload music assets:', error);
    }
  };

  const preloadGameAssets = async () => {
    try {
      await globalAssetPreloader.preloadAssets(GAME_ASSETS);
    } catch (error) {
      console.warn('Failed to preload game assets:', error);
    }
  };

  // window management
  const openApp = async (app) => {
    // Preload assets for specific apps
    if (app.id === 'music') {
      preloadMusicAssets(); 
    } else if (app.id === 'leaves') {
      preloadGameAssets(); 
    }
    const existingWindow = openWindows.find(w => w.id === app.id);
    if (existingWindow) {
      if (existingWindow.minimized) {
        minimizeWindow(app.id); 
        focusWindow(app.id);
      } else {
        focusWindow(app.id);
      }
      return;
    }

    const centerX = Math.max(50, (window.innerWidth - app.size.width) / 2);
    const centerY = Math.max(50, (window.innerHeight - app.size.height - 48) / 2); 

    const newWindow = {
      id: app.id,
      title: app.name,
      component: app.component,
      minimized: false,
      fullscreen: false,
      isActive: true,
      position: { 
        x: centerX + (openWindows.length * 30), 
        y: centerY + (openWindows.length * 30) 
      },
      size: app.size || { width: 600, height: 450 }
    };

    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindow(app.id);
    setNextZIndex(prev => prev + 1);
  };

  const closeWindow = (id) => {
    setClosingWindows(prev => new Set([...prev, id]));
    
    setTimeout(() => {
      setOpenWindows(prev => prev.filter(w => w.id !== id));
      setActiveWindow(prev => prev === id ? null : prev);
      setClosingWindows(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 50);
  };

  const minimizeWindow = (id) => {
    setOpenWindows(prev => 
      prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)
    );
    
    if (activeWindow === id) {
      const otherWindows = openWindows.filter(w => w.id !== id && !w.minimized);
      if (otherWindows.length > 0) {
        setActiveWindow(otherWindows[otherWindows.length - 1].id);
      } else {
        setActiveWindow(null);
      }
    }
  };

  const fullscreenWindow = (id) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === id ? { ...w, fullscreen: !w.fullscreen } : w)
    );
  };

  const focusWindow = (id) => {
    setActiveWindow(id);
    setOpenWindows(prev =>
      prev.map(w => ({ ...w, isActive: w.id === id }))
    );
  };

  const toggleWindow = (id) => {
    const window = openWindows.find(w => w.id === id);
    if (window) {
      if (window.minimized) {
        minimizeWindow(id);
        focusWindow(id);
      } else if (window.isActive) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    }
  };

  const updateWindowPosition = (id, position) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === id ? { ...w, position } : w)
    );
  };

  const updateWindowSize = (id, size) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === id ? { ...w, size } : w)
    );
  };

  const updateWindowTitle = (id, title) => {
  setOpenWindows(prev =>
    prev.map(w => w.id === id ? { ...w, title } : w)
  );
};

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleZozoClick = () => {
    const zozoApp = {
      id: "zozo-txt-" + Date.now(),
      name: "zozo-message.txt",
      icon: "📄",
      component: TxtFileApp,
      size: { width: 600, height: 450 }
    };
    openApp(zozoApp);
  };

  const handleFileOpen = (file, content) => {
    const fileApp = {
      id: `txt-${file.name}-${Date.now()}`,
      name: file.name,
      icon: "📄", 
      component: TxtFileApp,
      size: { width: 600, height: 450 }
    };
    openApp(fileApp);
  };

  const handleImageOpen = (imageName) => {
  const imageApp = {
    id: `img-${imageName.name}-${Date.now()}`,
    name: imageName.name, 
    icon: "🖼️",
    component: ImageViewerApp,
    size: { width: 700, height: 500 }
  };
  openApp(imageApp);
};

  // stage/screen transitions
  if (stage === 'loading') {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }
  if (stage === 'welcome') {
    return <WelcomeScreen onContinue={() => setStage('login')} />;
  }

  if (stage === 'login') {
  return <LoginScreen 
    onLogin={() => setStage('desktop')} 
    onBackToWelcome={() => setStage('welcome')} 
  />;
}

  //  desktop interface
  return (
    <div className="h-screen w-screen overflow-hidden relative select-none">
      {/* desktop */}
      <Desktop 
        apps={appsList} 
        onOpenApp={openApp}
      />

      {/* windows */}
      {openWindows.map(window => {
        const AppComponent = window.component;
        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onFullscreen={() => fullscreenWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            position={window.position}
            size={window.size}
            isActive={window.isActive}
            isMinimized={window.minimized}
            isFullscreen={window.fullscreen}
            onPositionChange={(position) => updateWindowPosition(window.id, position)}
            onSizeChange={(size) => updateWindowSize(window.id, size)}
          >
            <AppWrapper appId={window.id}>
              {/* handle different app types */}
              {window.id.startsWith('zozo-txt-') && (
                <TxtFileApp 
                fileName="zozo-message.txt"
                content={fileContents["zozo-message.txt"]}
                onClose={() => closeWindow(window.id)}
                />
             )}
             {window.id.startsWith('txt-') && !window.id.startsWith('zozo-txt-') && (
              <TxtFileApp 
              fileName={window.title}
              content={fileContents[window.title] || "File content not found."}
              onClose={() => closeWindow(window.id)}
              />
            )}
            {window.id.startsWith('img-') && (
              <ImageViewerApp 
              imageName={window.title}
              onClose={() => closeWindow(window.id)}
              onTitleChange={(newTitle) => updateWindowTitle(window.id, newTitle)}
              />
            )}
            {window.id === 'folder' && (
              <FolderApp 
              folderType="files" 
              onOpenFile={handleFileOpen}
              />
            )}
            {window.id === 'images' && (
              <FolderApp 
              folderType="images" 
              onOpenFile={handleImageOpen}
              />
            )}
            {/* og apps */}
            {!window.id.startsWith('zozo-txt-') && 
            !window.id.startsWith('txt-') && 
            !window.id.startsWith('img-') && 
            !['folder', 'images'].includes(window.id) && (
              window.id === 'music' ? (
              <AppComponent 
              onAppClose={window.isClosing} 
              isClosing={closingWindows.has(window.id)}
              />
            ) : (
            <AppComponent />
          )
          )}
          </AppWrapper>
          </Window>
        );
      })}

      {/* start menu */}
      <StartMenu
        apps={appsList}
        isOpen={isStartMenuOpen}
        onOpenApp={openApp}
        onClose={() => setIsStartMenuOpen(false)}
      />

      {/* taskbar  */}
      {/* WiFi sidebar */}
      <WiFiSidebar 
      isOpen={isWiFiOpen}
      onClose={() => setIsWiFiOpen(false)}
      onZozoClick={handleZozoClick}
      />
      
      {/* ENHANCED taskbar */}
      <Taskbar
      openWindows={openWindows}
      onToggleWindow={toggleWindow}
      onOpenStartMenu={toggleStartMenu}
      isStartMenuOpen={isStartMenuOpen}
      onCloseWindow={closeWindow}
      appsList={appsList}
      onOpenWiFi={() => setIsWiFiOpen(true)}
      />

      {/* outside click to close start menu */}
      {isStartMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsStartMenuOpen(false)}
        />
      )}
    </div>
  );
}