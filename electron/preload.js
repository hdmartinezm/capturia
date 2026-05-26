// Preload runs in the renderer with both Node and DOM access. We expose a
// minimal, typed-ish surface to window.capturia via contextBridge so the
// renderer never touches Node APIs directly (keeps contextIsolation safe).
//
// Surface kept tiny on purpose:
//   window.capturia.isDesktop  - boolean flag the renderer can check
//   window.capturia.onHotkey(handler) - subscribe to "toggle-voice" hotkey
//     events. Returns an unsubscribe function. Future hotkeys go through
//     the same channel with a distinguishing payload.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("capturia", {
  isDesktop: true,
  onHotkey(handler) {
    const listener = (_event, payload) => {
      try {
        handler(payload);
      } catch (err) {
        console.error("capturia.onHotkey handler threw:", err);
      }
    };
    ipcRenderer.on("hotkey", listener);
    return () => ipcRenderer.off("hotkey", listener);
  },
  // Renderer → main: transcribe a pre-encoded WAV (16kHz mono 16-bit PCM).
  // Returns plain transcript text. Reject on whisper failure (model missing,
  // build missing, etc.) so the renderer can surface the error.
  transcribe(wavBytes) {
    return ipcRenderer.invoke("whisper:transcribe", wavBytes);
  },
  // BYOK key vault. save/clear/list return the updated KeyEntry[] snapshot.
  // No `get` is exposed: the plaintext key never crosses IPC.
  keys: {
    save(provider, key) {
      return ipcRenderer.invoke("keys:save", { provider, key });
    },
    clear(provider) {
      return ipcRenderer.invoke("keys:clear", provider);
    },
    list() {
      return ipcRenderer.invoke("keys:list");
    },
  },
});
