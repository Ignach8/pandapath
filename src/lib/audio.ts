import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import type { SpeechLang } from "@/content/types";
import { useApp } from "@/store/app-store";

type Sfx = "correct" | "wrong" | "tap" | "complete";

const SOURCES: Record<Sfx, number> = {
  correct: require("../../assets/sounds/correct.wav"),
  wrong: require("../../assets/sounds/wrong.wav"),
  tap: require("../../assets/sounds/tap.wav"),
  complete: require("../../assets/sounds/complete.wav"),
};

const players: Partial<Record<Sfx, AudioPlayer>> = {};
let modeSet = false;

export const sfx = async (name: Sfx) => {
  const { sound } = useApp.getState();
  if (!sound) return;
  try {
    if (!modeSet) {
      modeSet = true;
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers" });
    }
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    await p.seekTo(0);
    p.play();
  } catch {
    /* el sonido nunca debe romper la lección */
  }
};

export const buzz = (kind: "ok" | "bad" | "tap" = "tap") => {
  if (!useApp.getState().haptics) return;
  try {
    if (kind === "tap") Haptics.selectionAsync();
    else Haptics.notificationAsync(kind === "ok" ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  } catch {
    /* sin vibración disponible */
  }
};

const RATE: Record<SpeechLang, [number, number]> = {
  "zh-CN": [0.85, 0.55],
  "en-US": [0.95, 0.7],
  "es-ES": [0.95, 0.75],
};

export const speak = (text: string, lang: SpeechLang, opts?: { slow?: boolean; onDone?: () => void }) => {
  const { slowTts } = useApp.getState();
  const slow = opts?.slow ?? slowTts;
  try {
    Speech.stop();
    Speech.speak(text, {
      language: lang,
      rate: RATE[lang][slow ? 1 : 0],
      onDone: opts?.onDone,
      onStopped: opts?.onDone,
      onError: opts?.onDone,
    });
  } catch {
    opts?.onDone?.();
  }
};

export const stopSpeaking = () => {
  try {
    Speech.stop();
  } catch {
    /* noop */
  }
};

let voiceCache: Promise<Record<"zh" | "en" | "es", boolean>> | null = null;

/** Detecta si el motor de voz del dispositivo tiene voces para cada idioma. */
export const voiceSupport = () => {
  voiceCache ??= (async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const has = (p: string) => voices.some((v) => v.language?.toLowerCase().startsWith(p));
      return { zh: has("zh"), en: has("en"), es: has("es") };
    } catch {
      return { zh: true, en: true, es: true };
    }
  })();
  return voiceCache;
};
