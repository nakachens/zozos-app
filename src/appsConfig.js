import CalculatorApp from "./apps/CalculatorApp";
import MusicPlayerApp from "./apps/MusicPlayerApp";
import WeatherApp from "./apps/WeatherApp";
import TicTacToeApp from "./apps/TicTacToeApp";
import NotebookApp from "./apps/NotebookApp";
import LeavesGameApp from "./apps/LeavesGameApp";
import SearchEngineApp from "./apps/SearchEngineApp";
import PoetryApp from "./apps/PoetryApp";
import MemoryGame from "./apps/MemoryGame";

export const appsList = [
  { 
    id: "calc", 
    name: "Calculator", 
    icon: "🔢", 
    component: CalculatorApp,
    size: { width: 280, height: 430 }
  },
  { 
    id: "music", 
    name: "Music Player", 
    icon: "🎵", 
    component: MusicPlayerApp,
    size: { width: 400, height: 520 }
  },
  { 
    id: "weather", 
    name: "Weather", 
    icon: "🌤️", 
    component: WeatherApp,
    size: { width: 520, height: 500 }
  },
  { 
    id: "tic", 
    name: "TicTacToe", 
    icon: "🎮", 
    component: TicTacToeApp,
    size: { width: 350, height: 465 }
  },
  { 
    id: "notes", 
    name: "Notebook", 
    icon: "📝", 
    component: NotebookApp,
    size: { width: 620, height: 470 }
  },
  { 
    id: "leaves", 
    name: "Leaves Game", 
    icon: "🍃", 
    component: LeavesGameApp,
    size: { width: 400, height: 450 }
  },
  { 
    id: "search", 
    name: "Search Engine", 
    icon: "🔍", 
    component: SearchEngineApp,
    size: { width: 500, height: 600 }
  },
  { 
    id: "poetry", 
    name: "Poetry", 
    icon: "📜", 
    component: PoetryApp,
    size: { width: 400, height: 480 }
  },
  { 
    id: "memory", 
    name: "Memory Game", 
    icon: "🔮", 
    component: MemoryGame,
    size: { width: 390, height: 550 }
  },
];