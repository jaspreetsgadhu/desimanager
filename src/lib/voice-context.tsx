"use client";

import * as React from "react";

export type VoiceLanguage = "en" | "hi" | "pa";

export const VOICE_LANGUAGE_LABELS: Record<VoiceLanguage, string> = {
  en: "English",
  hi: "Hindi",
  pa: "Punjabi",
};

const SAMPLE_PHRASES: Record<VoiceLanguage, string[]> = {
  en: [
    "What is our leave policy?",
    "How do I raise a customer refund?",
    "What's our remote work policy?",
  ],
  hi: [
    "Hamari leave policy kya hai?",
    "Customer refund kaise raise karein?",
    "Remote work policy kya hai?",
  ],
  pa: [
    "Sadi leave policy ki hai?",
    "Customer refund kive raise kariye?",
    "Remote work policy ki hai?",
  ],
};

const STORAGE_KEY = "desi-manager-voice-language";

interface VoiceContextValue {
  language: VoiceLanguage;
  setLanguage: (language: VoiceLanguage) => void;
  isListening: boolean;
  startListening: (onResult: (text: string) => void) => void;
  speak: (text: string) => void;
}

const VoiceContext = React.createContext<VoiceContextValue | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<VoiceLanguage>("en");
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as VoiceLanguage | null;
    if (stored && stored in VOICE_LANGUAGE_LABELS) setLanguageState(stored);
  }, []);

  const setLanguage = React.useCallback((lang: VoiceLanguage) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const startListening = React.useCallback(
    (onResult: (text: string) => void) => {
      if (isListening) return;
      setIsListening(true);
      const phrases = SAMPLE_PHRASES[language];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      window.setTimeout(() => {
        setIsListening(false);
        onResult(phrase);
      }, 1400);
    },
    [isListening, language]
  );

  const speak = React.useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : language === "pa" ? "pa-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  return (
    <VoiceContext.Provider value={{ language, setLanguage, isListening, startListening, speak }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = React.useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within a VoiceProvider");
  return ctx;
}
