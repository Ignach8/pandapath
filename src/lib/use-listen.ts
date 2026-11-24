import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useCallback, useState } from "react";
import type { SpeechLang } from "@/content/types";
import { stopSpeaking } from "./audio";

export type ListenState = {
  available: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

const isAvailable = () => {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
};

/** Reconocimiento de voz del dispositivo (Android: servicio de Google). */
export function useListen(lang: SpeechLang, opts?: { continuous?: boolean }): ListenState {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(() => isAvailable());

  useSpeechRecognitionEvent("result", (e) => {
    const text = e.results?.[0]?.transcript ?? "";
    setTranscript(text);
  });
  useSpeechRecognitionEvent("error", (e) => {
    setListening(false);
    if (e.error === "no-speech" || e.error === "aborted") return;
    if (e.error === "service-not-allowed" || e.error === "language-not-supported") setAvailable(false);
    setError(e.error);
  });
  useSpeechRecognitionEvent("end", () => setListening(false));

  const start = useCallback(async () => {
    stopSpeaking();
    setError(null);
    setTranscript("");
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setError("not-allowed");
        return;
      }
      ExpoSpeechRecognitionModule.start({ lang, interimResults: true, continuous: opts?.continuous ?? false });
      setListening(true);
    } catch {
      setAvailable(false);
    }
  }, [lang, opts?.continuous]);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      /* noop */
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return { available, listening, transcript, error, start, stop, reset };
}
