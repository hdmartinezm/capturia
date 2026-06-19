const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0b0e'
  });

  // Load the app
  if (process.argv.includes('--dev')) {
    // In dev mode, load from Next.js dev server
    mainWindow.loadURL('http://localhost:3000/studio');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built web app or local HTML
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ============================================
// Virtual Camera Frame Pipeline
// ============================================

const { VirtualCamera } = require('./virtual-camera');
let virtualCamera = null;

// Initialize virtual camera
ipcMain.handle('virtual-camera:init', async () => {
  try {
    virtualCamera = new VirtualCamera({
      width: 1920,
      height: 1080,
      fps: 30
    });
    await virtualCamera.start();
    return { success: true };
  } catch (error) {
    console.error('Failed to init virtual camera:', error);
    return { success: false, error: error.message };
  }
});

// Send frame to virtual camera
ipcMain.handle('virtual-camera:send-frame', async (event, frameData) => {
  if (!virtualCamera) {
    return { success: false, error: 'Virtual camera not initialized' };
  }

  try {
    await virtualCamera.sendFrame(frameData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Stop virtual camera
ipcMain.handle('virtual-camera:stop', async () => {
  if (virtualCamera) {
    await virtualCamera.stop();
    virtualCamera = null;
  }
  return { success: true };
});

// Get available screens for capture
ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 320, height: 180 }
  });

  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL()
  }));
});

console.log('Capturia Desktop starting...');
