import { getLocales } from "expo-localization";
import { useCallback } from "react";
import type { L, Lang } from "@/content/types";
import { useApp } from "@/store/app-store";
import { K, STRINGS } from "./strings";

const TR = require("../content/toefl-tr.json") as Record<string, { es: string; zh: string }>;

/** Instrucciones de ejercicios en inglés → clave de la interfaz (se muestran en el idioma de la app). */
const INSTR: Record<string, K> = {
  "Complete the word": "ex_complete_word",
  "Choose the best response.": "ex_choose_response",
  "Type the missing word": "ex_type_missing",
  "Listen and choose the word you hear.": "ex_listen_word",
};

/** Traducción de un texto en inglés (contenido TOEFL) al idioma de la app, si existe. */
export const trLookup = (lang: Lang, en: string | undefined): string | undefined => {
  if (!en || lang === "en") return undefined;
  return TR[en]?.[lang];
};

export type { K };

export const detectLang = (): Lang => {
  try {
    const code = getLocales()[0]?.languageCode ?? "es";
    return code === "zh" ? "zh" : code === "en" ? "en" : "es";
  } catch {
    return "es";
  }
};

export const translate = (lang: Lang, key: K, vars?: Record<string, string | number>) => {
  let s: string = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
};

/** Texto localizado con respaldo: idioma de la app → inglés → español. */
export const loc = (l: L | undefined, lang: Lang): string => {
  if (!l) return "";
  if (lang === "zh") return l.zh ?? l.en;
  return (l[lang] ?? l.en) as string;
};

export const useT = () => {
  const lang = useApp((s) => s.uiLang);
  const t = useCallback((key: K, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  const l = useCallback((x: L | undefined) => loc(x, lang), [lang]);
  const showTr = useApp((s) => s.showTranslation);
  /** Traducción opcional (según el ajuste «Mostrar traducción»). */
  const tr = useCallback((en: string | undefined) => (showTr ? trLookup(lang, en) : undefined), [lang, showTr]);
  /** Texto de instrucción/etiqueta: traducido si hay traducción (siempre, aunque el ajuste esté apagado). */
  const tl = useCallback(
    (en: string): string => {
      const k = INSTR[en];
      if (k) return translate(lang, k);
      return trLookup(lang, en) ?? en;
    },
    [lang],
  );
  /** Solo instrucciones de ejercicio: se traducen; el enunciado de contenido sigue en inglés. */
  const ti = useCallback((en: string): string => (INSTR[en] ? translate(lang, INSTR[en]) : en), [lang]);
  return { t, l, lang, tr, tl, ti };
};
