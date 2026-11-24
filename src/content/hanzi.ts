type CharData = { strokes: string[]; medians: number[][][] };

let cache: Record<string, CharData> | null = null;

const load = () => {
  cache ??= require("./generated/hanzi-1-3.json") as Record<string, CharData>;
  return cache;
};

/** Trazos incluidos en la app (HSK 1–3, funcionan sin conexión). */
export const getCharData = (ch: string): CharData | undefined => load()[ch];
export const hasCharData = (ch: string) => !!load()[ch];
export const isHan = (ch: string) => /[一-鿿]/.test(ch);
