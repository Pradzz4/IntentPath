import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from './usePreferences';

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!('speechSynthesis' in window)) return null;
  if (!('SpeechSynthesisUtterance' in window)) return null;
  return window.speechSynthesis;
}

export interface SpeechState {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  speaking: boolean;
  error: string | null;
  speak: (text: string) => void;
  stop: () => void;
  refreshVoices: () => void;
  selectedVoice: SpeechSynthesisVoice | null;
}

/**
 * Browser-native speech only. Speech is always triggered by an explicit press;
 * this hook has no effect that speaks on its own.
 */
export function useSpeech(): SpeechState {
  const { preferences } = usePreferences();
  const synth = getSynth();
  const supported = synth !== null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voiceRevision, setVoiceRevision] = useState(0);

  const refreshVoices = useCallback(() => {
    if (!synth) return;
    setVoices(synth.getVoices());
    setVoiceRevision((revision) => revision + 1);
  }, [synth]);

  useEffect(() => {
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener('voiceschanged', load);
    // Some browsers expose voices only after a short delay or first interaction.
    const timerA = window.setTimeout(load, 250);
    const timerB = window.setTimeout(load, 1200);
    return () => {
      synth.removeEventListener('voiceschanged', load);
      window.clearTimeout(timerA);
      window.clearTimeout(timerB);
    };
  }, [synth]);

  useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  const stop = useCallback(() => {
    if (!synth) return;
    utteranceRef.current = null;
    synth.cancel();
    setSpeaking(false);
  }, [synth]);

  const speak = useCallback(
    (text: string) => {
      const message = text.trim();
      if (!synth) {
        setError('Speech is not available in this browser.');
        return;
      }
      if (!message) {
        setError('There is no message to speak yet.');
        return;
      }

      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = preferences.speechRate;
        utterance.pitch = preferences.speechPitch;
        utterance.volume = preferences.speechVolume;

        const availableVoices = voices.length > 0 ? voices : synth.getVoices();
        const preferred = preferences.voiceURI
          ? availableVoices.find((voice) => voice.voiceURI === preferences.voiceURI)
          : null;
        const english = availableVoices.find((voice) => voice.lang?.toLowerCase().startsWith('en'));
        const voice = preferred ?? english ?? availableVoices[0];
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }

        utterance.onstart = () => {
          if (utteranceRef.current === utterance) setSpeaking(true);
        };
        utterance.onend = () => {
          if (utteranceRef.current === utterance) {
            setSpeaking(false);
            utteranceRef.current = null;
          }
        };
        utterance.onerror = (event) => {
          if (utteranceRef.current !== utterance) return;
          if (event.error !== 'canceled' && event.error !== 'interrupted') {
            setError('The message could not be spoken. Please try again.');
          }
          setSpeaking(false);
          utteranceRef.current = null;
        };

        utteranceRef.current = utterance;
        setError(null);
        setSpeaking(true);
        synth.speak(utterance);
      } catch {
        setError('Speech is not available in this browser.');
        setSpeaking(false);
      }
    },
    [
      synth,
      preferences.speechRate,
      preferences.speechPitch,
      preferences.speechVolume,
      preferences.voiceURI,
      voices,
    ],
  );

  const selectedVoice =
    (preferences.voiceURI
      ? voices.find((voice) => voice.voiceURI === preferences.voiceURI)
      : undefined) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('en')) ??
    voices[0] ??
    null;

  return {
    supported,
    voices,
    speaking,
    error,
    speak,
    stop,
    refreshVoices,
    selectedVoice: voiceRevision >= 0 ? selectedVoice : selectedVoice,
  };
}
