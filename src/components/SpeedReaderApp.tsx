"use client";

import { useState, useEffect, useRef } from "react";
import { useRSVP } from "@/hooks/useRSVP";

type AppState = "INPUT" | "COUNTDOWN" | "READING" | "FULL_TEXT";

const PG_ESSAYS = [
  "greatwork",
  "kids",
  "selfindulgence",
  "lies",
  "re",
  "mean",
  "hs",
  "vb",
  "brandage",
  "field",
  "goodwriting",
  "do",
  "woke",
  "writes",
  "when",
  "foundermode",
  "persistence",
  "reddits",
  "google",
  "best",
  "superlinear",
  "getideas",
  "read",
  "want",
  "alien",
  "users",
  "heresy",
  "words",
  "goodtaste",
  "smart",
  "weird",
  "hwh",
  "own",
  "fn",
  "newideas",
  "nft",
  "real",
  "richnow",
  "simply",
  "donate",
  "worked",
  "earnest",
  "ace",
  "airbnbs",
  "think",
  "early",
  "wtax",
  "conformism",
  "orth",
  "cred",
  "useful",
  "noob",
  "fh",
  "mod",
  "fp",
  "lesson",
  "nov",
  "genius",
  "sun",
  "pow",
  "disc",
  "pgh",
  "ineq",
  "jessica",
  "bias",
  "talk",
  "aord",
  "safe",
  "name",
  "altair",
  "ronco",
  "work",
  "corpdev",
  "95",
  "ecw",
  "know",
  "pinch",
  "before",
  "fr",
  "herd",
  "convince",
  "ds",
  "invtrend",
  "startupideas",
  "hw",
  "growth",
  "swan",
  "todo",
  "speak",
  "ycstart",
  "property",
  "ambitious",
  "word",
  "schlep",
  "vw",
  "hubs",
  "patentpledge",
  "airbnb",
  "control",
  "tablets",
  "founders",
  "superangels",
  "seesv",
  "hiresfund",
  "yahoo",
  "future",
  "addiction",
  "top",
  "organic",
  "apple",
  "really",
  "discover",
  "publishing",
  "nthings",
  "determination",
  "kate",
  "segway",
  "ramenprofitable",
  "makersschedule",
  "revolution",
  "twitter",
  "foundervisa",
  "5founders",
  "relres",
  "angelinvesting",
  "convergence",
  "maybe",
  "hackernews",
  "13sentences",
  "identity",
  "credentials",
  "divergence",
  "highres",
  "artistsship",
  "badeconomy",
  "fundraising",
  "prcmc",
  "cities",
  "distraction",
  "good",
  "googles",
  "heroes",
  "disagree",
  "boss",
  "ycombinator",
  "trolls",
  "newthings",
  "startuphubs",
  "webstartups",
  "philosophy",
  "colleges",
  "die",
  "head",
  "stuff",
  "equity",
  "unions",
  "guidetoinvestors",
  "judgement",
  "microsoft",
  "notnot",
  "wisdom",
  "foundersatwork",
  "goodart",
  "startupmistakes",
  "mit",
  "investors",
  "copy",
  "island",
  "marginal",
  "america",
  "siliconvalley",
  "startuplessons",
  "randomness",
  "softwarepatents",
  "6631327",
  "whyyc",
  "love",
  "procrastination",
  "web20",
  "startupfunding",
  "vcsqueeze",
  "ideas",
  "sfp",
  "inequality",
  "ladder",
  "opensource",
  "hiring",
  "submarine",
  "bronze",
  "mac",
  "writing44",
  "college",
  "venturecapital",
  "start",
  "usa",
  "charisma",
  "polls",
  "laundry",
  "bubble",
  "essay",
  "pypar",
  "gh",
  "gap",
  "wealth",
  "gba",
  "say",
  "ffb",
  "hp",
  "iflisp",
  "hundred",
  "nerds",
  "better",
  "desres",
  "spam",
  "icad",
  "power",
  "fix",
  "taste",
  "noop",
  "diff",
  "road",
  "rootsoflisp",
  "langdes",
  "popular",
  "javacover",
  "avg",
  "lwba",
  "progbot",
  "prop62",
  "rss",
];

export default function SpeedReaderApp() {
  const [appState, setAppState] = useState<AppState>("INPUT");
  const [inputText, setInputText] = useState("");

  const [urlInput, setUrlInput] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [countdown, setCountdown] = useState<number | string>(3);
  const [isFastCountdown, setIsFastCountdown] = useState(false);

  const [animations, setAnimations] = useState<
    { id: string; type: "FASTER" | "SLOWER" }[]
  >([]);

  const [isMouseIdle, setIsMouseIdle] = useState(false);

  // Mouse idle logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleActivity = () => {
      setIsMouseIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMouseIdle(true), 2000);
    };

    handleActivity();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  const triggerFlash = (type: "FASTER" | "SLOWER") => {
    const id = Date.now().toString() + Math.random().toString();
    setAnimations((prev) => [...prev, { id, type }]);

    // Auto remove after animation completes (400ms)
    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== id));
    }, 400);
  };

  const {
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
    setCurrentIndex,
  } = useRSVP(200);

  // Countdown timer logic
  useEffect(() => {
    if (appState === "COUNTDOWN") {
      if (countdown === "GO") {
        const timer = setTimeout(() => {
          setAppState("READING");
          play();
        }, 500);
        return () => clearTimeout(timer);
      } else if (typeof countdown === "number" && countdown > 0) {
        const timer = setTimeout(
          () => {
            setCountdown(countdown - 1 === 0 ? "GO" : countdown - 1);
          },
          isFastCountdown ? 300 : 800,
        );
        return () => clearTimeout(timer);
      }
    }
  }, [appState, countdown, play, isFastCountdown]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active word in FULL_TEXT mode
  const activeWordRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (appState === "FULL_TEXT" && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [appState, currentIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in text area
      if (appState === "INPUT") return;

      // Prevent default scrolling for space and arrows
      if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "Escape") {
        setAppState("INPUT");
        pause();
      } else if (e.key === "f" || e.key === "F") {
        if (appState === "READING") {
          pause();
          setAppState("FULL_TEXT");
        } else if (appState === "FULL_TEXT") {
          setIsFastCountdown(true);
          setCountdown(3);
          setAppState("COUNTDOWN");
        }
      } else if (e.key === "p" || e.key === "P") {
        if (appState === "READING") {
          togglePause();
        }
      } else if (e.key === " ") {
        if (e.ctrlKey) {
          if (appState === "READING") adjustWpm(-20);
          triggerFlash("SLOWER");
        } else {
          if (appState === "READING") {
            adjustWpm(20);
            triggerFlash("FASTER");
          }
        }
      } else if (e.key === "ArrowLeft") {
        rewind();
      } else if (e.key === "ArrowRight") {
        skipForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    appState,
    pause,
    togglePause,
    adjustWpm,
    rewind,
    skipForward,
    isPlaying,
    wpm,
  ]);

  const handleStart = async () => {
    if (!inputText.trim()) return;
    await loadText(inputText);
    setIsFastCountdown(false);
    setCountdown(3);
    setAppState("COUNTDOWN");
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    setErrorMsg("");
    try {
      let formattedUrl = urlInput.trim();
      if (formattedUrl.startsWith("http://"))
        formattedUrl = formattedUrl.slice(7);
      if (formattedUrl.startsWith("https://"))
        formattedUrl = formattedUrl.slice(8);

      const res = await fetch(`https://defuddle.md/${formattedUrl}`);
      if (!res.ok) throw new Error("Failed to fetch URL");
      const text = await res.text();
      setInputText(text);
      setUrlInput("");
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to fetch content.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleFetchPreset = (url: string) => {
    setUrlInput(url);
    // Timeout to allow state to update before fetching
    setTimeout(() => {
      const fetchButton = document.getElementById("fetch-url-button");
      if (fetchButton) fetchButton.click();
    }, 50);
  };

  const renderCurrentWord = () => {
    const word = words[currentIndex] || "";
    if (!word) return null;

    // Highlight first 3 chars
    const firstPart = word.substring(0, 3);
    const rest = word.substring(3);

    return (
      <div className="flex w-full items-center justify-center font-mono text-4xl sm:text-5xl md:text-6xl select-none z-10">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-start">
          <span className="font-bold">{firstPart}</span>
          <span className="opacity-80 whitespace-nowrap">{rest}</span>
        </div>
      </div>
    );
  };

  if (appState === "INPUT") {
    return (
      <div className="w-full flex flex-col gap-6 max-w-2xl mx-auto mt-12 sm:mt-24">
        <h1 className="text-xl font-bold uppercase tracking-widest text-gray-500">
          RSVP Speed Reader
        </h1>
        <textarea
          className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 bg-transparent resize-none font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors custom-scrollbar"
          placeholder="Paste your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <button
            className="px-6 py-3 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-mono uppercase tracking-widest text-sm font-bold disabled:opacity-50"
            onClick={handleStart}
            disabled={isFetchingUrl}
          >
            Start Reading
          </button>

          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <div className="flex w-full sm:w-auto h-12">
              <input
                type="text"
                placeholder="Or fetch from URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="px-4 py-2 border-y border-l border-gray-300 dark:border-gray-700 bg-transparent font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white w-full sm:w-64"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFetchUrl();
                }}
              />
              <button
                id="fetch-url-button"
                className="px-4 border border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors font-mono text-sm disabled:opacity-50 min-w-25"
                onClick={handleFetchUrl}
                disabled={isFetchingUrl || !urlInput.trim()}
              >
                {isFetchingUrl ? "..." : "Fetch"}
              </button>
            </div>
            {errorMsg && (
              <span className="text-red-500 font-mono text-xs">{errorMsg}</span>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-mono text-gray-500 mb-4 uppercase tracking-widest">
            Try an Example:
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleFetchPreset("paulgraham.com/greatwork.html")}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors font-mono text-sm text-left"
              disabled={isFetchingUrl}
            >
              <div className="font-bold">How to Do Great Work</div>
              <div className="text-gray-500 text-xs">Paul Graham</div>
            </button>

            <button
              onClick={() => {
                const randomSlug =
                  PG_ESSAYS[Math.floor(Math.random() * PG_ESSAYS.length)];
                handleFetchPreset(`paulgraham.com/${randomSlug}.html`);
              }}
              className="px-4 py-2 border border-blue-300 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-mono text-sm flex items-center justify-center gap-2"
              disabled={isFetchingUrl}
            >
              <span className="text-lg">🎲</span> Random PG Essay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "FULL_TEXT") {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 pb-24">
        <div className="mb-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
          <span className="font-mono text-sm text-gray-500">
            Show Full Text
          </span>
          <button
            onClick={() => setAppState("READING")}
            className="text-sm border border-transparent font-mono px-3 py-1 hover:border-black dark:hover:border-white transition-colors"
          >
            [F] Return to RSVP
          </button>
        </div>
        <div className="leading-relaxed text-base sm:text-lg font-mono">
          {words.map((w, i) => (
            <span
              key={i}
              ref={i === currentIndex ? activeWordRef : null}
              onClick={() => {
                setCurrentIndex(i);
                setIsFastCountdown(true);
                setCountdown(3);
                setAppState("COUNTDOWN");
              }}
              className={`inline-block mr-2 mb-2 cursor-pointer px-1 rounded-sm transition-colors ${
                i === currentIndex
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // READING MODE
  return (
    <div
      className={`w-full h-[90vh] flex flex-col justify-between relative overflow-hidden
         ${appState === "READING" && isMouseIdle ? "cursor-none" : ""}`}
      ref={containerRef}
    >
      {/* Background Pause Icon */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-0 transition-all duration-500 ease-out ${
          appState === "READING" && !isPlaying
            ? "opacity-100 scale-100"
            : "opacity-0 scale-150"
        }`}
      >
        <div className="flex gap-4 sm:gap-6 md:gap-8 opacity-[0.02] dark:opacity-[0.01]">
          <div className="w-16 sm:w-24 md:w-32 h-64 sm:h-96 md:h-128 bg-black dark:bg-white rounded-full"></div>
          <div className="w-16 sm:w-24 md:w-32 h-64 sm:h-96 md:h-128 bg-black dark:bg-white rounded-full"></div>
        </div>
      </div>

      {/* Stackable Directional Flashes */}
      {animations
        .filter((a) => a.type === "FASTER")
        .map((anim) => (
          <div
            key={anim.id}
            className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none z-0 flex items-center justify-end pr-8 sm:pr-16 mix-blend-screen dark:mix-blend-lighten"
          >
            <div className="animate-[flash-right_0.4s_ease-out_forwards] flex text-black/20 dark:text-white/20 text-8xl sm:text-9xl">
              <span className="-mr-8 sm:-mr-12">❯</span>
              <span>❯</span>
            </div>
          </div>
        ))}

      {animations
        .filter((a) => a.type === "SLOWER")
        .map((anim) => (
          <div
            key={anim.id}
            className="absolute top-0 left-0 bottom-0 w-1/3 pointer-events-none z-0 flex items-center justify-start pl-8 sm:pl-16 mix-blend-screen dark:mix-blend-lighten"
          >
            <div className="animate-[flash-left_0.4s_ease-out_forwards] flex text-black/20 dark:text-white/20 text-8xl sm:text-9xl">
              <span>❮</span>
              <span className="-ml-8 sm:-ml-12">❮</span>
            </div>
          </div>
        ))}

      <div className="w-full flex justify-between items-start font-mono text-xs sm:text-sm text-gray-500 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-4 max-w-2xl mx-auto z-10">
        <div className="w-24">WPM: {wpm}</div>
        <div className="flex-1 text-center font-bold">
          {isPlaying ? "PLAYING" : "PAUSED"}
        </div>
        <div className="w-32 text-right">
          Word: {Math.min(currentIndex + 1, words.length)} / {words.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        {appState === "COUNTDOWN" ? (
          <div
            key={countdown}
            className="text-6xl sm:text-8xl md:text-9xl font-bold font-mono animate-pulse"
          >
            {countdown}
          </div>
        ) : (
          renderCurrentWord()
        )}
      </div>

      <div className="w-full max-w-2xl mx-auto mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-xs font-mono text-gray-500">
          <div>
            <b className="text-black dark:text-white">SPACE</b> Increase speed
          </div>
          <div>
            <b className="text-black dark:text-white">CTRL+SPACE</b> Decrease
            speed
          </div>
          <div>
            <b className="text-black dark:text-white">P</b> Pause / Resume
          </div>
          <div>
            <b className="text-black dark:text-white">← / →</b> Rewind / Skip
          </div>
          <div>
            <b className="text-black dark:text-white">F</b> Show Full Text
          </div>
          <div>
            <b className="text-black dark:text-white">ESC</b> Exit session
          </div>
        </div>
        <div className="mt-4 w-full h-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${(currentIndex / Math.max(1, words.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
