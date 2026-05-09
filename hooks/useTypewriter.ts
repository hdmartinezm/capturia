"use client";
import { useEffect, useState } from "react";

/**
 * Reveals `text` one character at a time. Resets when text changes.
 */
export function useTypewriter(text: string, msPerChar = 28): string {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar]);

  return displayed;
}
