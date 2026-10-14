import React, { useEffect, useRef, useState } from "react";

const SpeechRecognitionCtor =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function MicButton({ lang, onResult, disabled, labelListening, labelIdle, unsupportedLabel }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const supported = Boolean(SpeechRecognitionCtor);

  useEffect(() => {
    if (!supported) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN";
    }
  }, [lang]);

  const toggle = () => {
    if (!supported || disabled) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  if (!supported) {
    return (
      <span className="text-xs text-[#4A5852] italic px-2" title={unsupportedLabel}>
        Voice input N/A
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? labelListening : labelIdle}
      className={`h-11 w-11 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
        listening
          ? "bg-[#B91C1C] border-[#B91C1C] text-white"
          : "bg-white dark:bg-[#15201C] border-[#D3DDD8] dark:border-[#24352F] text-[#0D5C4E] dark:text-[#15806C] hover:bg-[#EAF3F0]"
      } disabled:opacity-40`}
    >
      {listening ? (
        <span className="w-3.5 h-3.5 rounded-sm bg-white animate-pulse" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}
