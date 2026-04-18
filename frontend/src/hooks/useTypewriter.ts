"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;       // ms per character
  startDelay?: number;  // ms before starting
}

interface UseTypewriterReturn {
  displayText: string;
  isComplete: boolean;
  cursorVisible: boolean;
}

export function useTypewriter({
  text,
  speed = 65,
  startDelay = 400,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback(() => {
    if (indexRef.current < text.length) {
      indexRef.current += 1;
      setDisplayText(text.slice(0, indexRef.current));
      timerRef.current = setTimeout(tick, speed + Math.random() * 40 - 20);
    } else {
      setIsComplete(true);
    }
  }, [text, speed]);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayText("");
    setIsComplete(false);
    setCursorVisible(true);

    const startTimer = setTimeout(() => {
      tick();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, startDelay, tick]);

  // Keep cursor blinking after completion for a while, then hide
  useEffect(() => {
    if (isComplete) {
      const hideTimer = setTimeout(() => {
        setCursorVisible(false);
      }, 3000);
      return () => clearTimeout(hideTimer);
    }
  }, [isComplete]);

  return { displayText, isComplete, cursorVisible };
}
