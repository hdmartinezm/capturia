const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('capturia', {
  isDesktop: true,
  platform: process.platform,

  // Virtual Camera API
  virtualCamera: {
    init: () => ipcRenderer.invoke('virtual-camera:init'),
    sendFrame: (frameData) => ipcRenderer.invoke('virtual-camera:send-frame', frameData),
    stop: () => ipcRenderer.invoke('virtual-camera:stop')
  },

  // Screen capture
  getSources: () => ipcRenderer.invoke('get-sources'),

  // App info
  getVersion: () => ipcRenderer.invoke('get-version')
});

console.log('Capturia preload script loaded');
