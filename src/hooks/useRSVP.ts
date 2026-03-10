import { useState, useEffect, useRef, useCallback } from 'react';

import { marked } from 'marked';
import he from 'he';

export async function tokenize(text: string): Promise<string[]> {
  // 1. Strip out YAML frontmatter (often returned by defuddle.md)
  let cleanText = text.replace(/^---[\s\S]*?---\n*/, '');
  
  // 2. Remove Paul Graham style footnote links like \[[1](https://...)\]
  cleanText = cleanText.replace(/\\\[\[\d+\](\([^)]+\))?\\\]/g, '');
  
  // 3. Remove inline URLs that might not be formatted as markdown links
  cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '');

  // Convert markdown to HTML, then strip HTML tags to get pure text content
  const html = await marked.parse(cleanText);
  const plainText = html.replace(/<[^>]*>?/gm, '');
  const decodedText = he.decode(plainText);
  return decodedText.trim().split(/\s+/).filter(w => w.length > 0);
}

export function useRSVP(initialWpm = 200) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(initialWpm);
  
  const isPlayingRef = useRef(isPlaying);
  const wpmRef = useRef(wpm);
  const wordsRef = useRef(words);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { wordsRef.current = words; }, [words]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const loadText = useCallback(async (text: string) => {
    try {
      const tokens = await tokenize(text);
      setWords(tokens);
      setCurrentIndex(0);
      setIsPlaying(false);
    } catch (e) {
      console.error("Failed to parse text", e);
    }
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePause = useCallback(() => setIsPlaying(prev => !prev), []);
  
  const adjustWpm = useCallback((delta: number) => {
    setWpm(prev => Math.min(800, Math.max(120, prev + delta)));
  }, []);

  const skipForward = useCallback(() => {
    setCurrentIndex(prev => Math.min(wordsRef.current.length - 1, prev + 10));
  }, []);

  const rewind = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 10));
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      if (!isPlayingRef.current) return;
      
      const currentWords = wordsRef.current;
      const index = currentIndexRef.current;
      
      if (index >= currentWords.length - 1) {
        setIsPlaying(false);
        return;
      }
      
      const currentWord = currentWords[index];
      const baseDelay = 60000 / wpmRef.current;
      let extraDelay = 0;
      
      if (currentWord) {
        if (currentWord.endsWith(',')) extraDelay += 80;
        else if (currentWord.match(/[.!?;:]$/)) extraDelay += 150;
        
        // Remove punctuation for length check
        const cleanWord = currentWord.replace(/[.,!?;:]/g, '');
        if (cleanWord.length > 8) extraDelay += 50;
      }
      
      const totalDelay = baseDelay + extraDelay;
      
      timeoutId = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        tick();
      }, totalDelay);
    };

    if (isPlaying) {
      tick();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlaying]);

  return {
    words,
    currentIndex,
    isPlaying,
    wpm,
    loadText,
    play,
    pause,
    togglePause,
    adjustWpm,
    skipForward,
    rewind,
    setCurrentIndex
  };
}
