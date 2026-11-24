import { getLocales } from "expo-localization";
import { useCallback } from "react";
import type { L, Lang } from "@/content/types";
import { useApp } from "@/store/app-store";
import { K, STRINGS } from "./strings";

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
  return { t, l, lang };
};
