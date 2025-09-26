const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Better production detection - check if dist folder exists and has index.html
const distPath = path.join(__dirname, '../dist/index.html');
const hasBuiltFiles = fs.existsSync(distPath);
const isDev = !hasBuiltFiles || process.env.NODE_ENV === 'development';

console.log('isDev:', isDev);
console.log('hasBuiltFiles:', hasBuiltFiles);
console.log('distPath:', distPath);

// Only enable live reload in development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (error) {
    console.log('electron-reload not available:', error.message);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'zozo-icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the React app - use built files if they exist
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${distPath}`;
  
  console.log('Loading URL:', startUrl);
  
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// Add this function to handle asset paths
function getAssetPath(assetName) {
  if (isDev) {
    return `http://localhost:5173/${assetName}`;
  } else {
    return path.join(__dirname, '..', 'dist', assetName);
  }
}
// Rest of your menu code...
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'About zozOS',
        click: () => {
          shell.openExternal('https://your-website.com');
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);