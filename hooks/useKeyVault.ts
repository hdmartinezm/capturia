"use client";
import { useCallback, useEffect, useState } from "react";
import type { KeyEntry, KeyProvider } from "./useDesktopHotkey";

interface UseKeyVault {
  keys: KeyEntry[];
  isReady: boolean;
  isDesktop: boolean;
  save: (provider: KeyProvider, key: string) => Promise<void>;
  clear: (provider: KeyProvider) => Promise<void>;
  refresh: () => Promise<void>;
}

// React hook for managing BYOK keys via the Electron keychain. On web (no
// window.capturia), every method is a safe no-op and keys is always empty.
// Methods update local state to match what main returns, so the UI stays
// in sync without a separate refetch.
export function useKeyVault(): UseKeyVault {
  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    const bridge = window.capturia;
    if (!bridge?.keys) {
      setIsReady(true);
      return;
    }
    try {
      const list = await bridge.keys.list();
      setKeys(list);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsDesktop(window.capturia?.isDesktop === true);
    void refresh();
  }, [refresh]);

  const save = useCallback(async (provider: KeyProvider, key: string) => {
    if (!window.capturia?.keys) {
      throw new Error("Key vault is only available in the desktop app.");
    }
    const updated = await window.capturia.keys.save(provider, key);
    setKeys(updated);
  }, []);

  const clear = useCallback(async (provider: KeyProvider) => {
    if (!window.capturia?.keys) return;
    const updated = await window.capturia.keys.clear(provider);
    setKeys(updated);
  }, []);

  return { keys, isReady, isDesktop, save, clear, refresh };
}
