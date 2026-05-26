// Capturia desktop wrapper. Loads the Next.js studio in a BrowserWindow.
// In dev: points at http://localhost:3000/studio (Next.js dev server).
// In prod (later): will load a bundled build. Until then, packaged builds are
// not supported by this file.
//
// First-scaffold scope: validate the renderer works in Electron with camera
// and mic permissions. No virtual camera publishing, no IPC bridge, no custom
// chrome. Those come in later Phase 1 steps.

const { app, BrowserWindow, session, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const { transcribeWav } = require("./whisper");
const keychain = require("./keychain");

// Push-to-talk hotkey. Cmd+Alt+Space on Mac, Ctrl+Alt+Space elsewhere.
// Chosen to avoid Spotlight (Cmd+Space) and the macOS character viewer
// (Cmd+Ctrl+Space). User-configurable in a later Phase 1 step.
const HOTKEY_TOGGLE_VOICE = "CmdOrCtrl+Alt+Space";

const isDev = !app.isPackaged;
const STUDIO_URL = isDev
  ? "http://localhost:3000/studio"
  : `file://${path.join(__dirname, "../out/studio.html")}`;

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#000000",
    title: "Capturia",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(STUDIO_URL);
}

// Single-instance lock so launching Capturia twice focuses the existing
// window instead of opening a second one with conflicting camera access.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Auto-grant camera + mic for the studio. Later phases will scope this
    // by URL once we have a settings UI for first-launch permission flow.
    session.defaultSession.setPermissionRequestHandler(
      (_webContents, permission, callback) => {
        callback(permission === "media");
      }
    );

    // Renderer → main: transcribe an in-memory WAV buffer with local whisper.
    // Returns plain transcript string (timestamps stripped).
    ipcMain.handle("whisper:transcribe", async (_event, wavBuffer) => {
      return await transcribeWav(wavBuffer);
    });

    // Renderer → main: encrypted BYOK key vault. The plaintext key is never
    // returned across IPC; listKeys returns only presence + a masked tail.
    ipcMain.handle("keys:save", (_event, payload) => {
      keychain.saveKey(payload.provider, payload.key);
      return keychain.listKeys();
    });
    ipcMain.handle("keys:clear", (_event, provider) => {
      keychain.clearKey(provider);
      return keychain.listKeys();
    });
    ipcMain.handle("keys:list", () => keychain.listKeys());

    createWindow();

    // Global push-to-talk hotkey. Works even when Capturia isn't focused,
    // so users can toggle voice mid-Zoom-call without alt-tabbing.
    const registered = globalShortcut.register(HOTKEY_TOGGLE_VOICE, () => {
      mainWindow?.webContents.send("hotkey", { action: "toggle-voice" });
    });
    if (!registered) {
      console.warn(`Failed to register hotkey ${HOTKEY_TOGGLE_VOICE} (in use?)`);
    }
  });
}

// Clean up the global shortcut so it doesn't linger past app exit.
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// macOS: keep the app alive when all windows close (re-open via dock).
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS: re-create the window when the user clicks the dock icon and there
// are no open windows.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
