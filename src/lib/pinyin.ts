const MARKS: Record<string, string> = {
  a: "āáǎà",
  e: "ēéěè",
  i: "īíǐì",
  o: "ōóǒò",
  u: "ūúǔù",
  ü: "ǖǘǚǜ",
};

const BASE_OF: Record<string, [string, number]> = {};
for (const [base, marks] of Object.entries(MARKS)) {
  [...marks].forEach((m, i) => {
    BASE_OF[m] = [base, i + 1];
  });
}

/** Sílabas de una cadena de pinyin (ignora puntuación). */
export const syllables = (pinyin: string): string[] =>
  pinyin
    .split(/\s+/)
    .map((s) => s.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);

/** 0 = tono neutro, 1–4 = tonos. */
export const toneOf = (syl: string): number => {
  for (const ch of syl) if (BASE_OF[ch]) return BASE_OF[ch][1];
  return 0;
};

export const plain = (syl: string): string =>
  [...syl].map((ch) => (BASE_OF[ch] ? BASE_OF[ch][0] : ch)).join("");

export const applyTone = (base: string, tone: number): string => {
  const p = plain(base).toLowerCase();
  if (tone < 1 || tone > 4) return p;
  const vowels = [...p].filter((c) => "aeiouü".includes(c));
  if (!vowels.length) return p;
  let target = vowels[vowels.length - 1];
  if (p.includes("a")) target = "a";
  else if (p.includes("e")) target = "e";
  else if (p.includes("ou")) target = "o";
  const idx = p.indexOf(target);
  return p.slice(0, idx) + MARKS[target][tone - 1] + p.slice(idx + 1);
};

/** Variantes del mismo pinyin cambiando el tono de una sílaba (para ejercicios de tonos). */
export const toneVariants = (pinyin: string, want = 3): string[] => {
  const syls = syllables(pinyin);
  if (!syls.length) return [];
  const pos = Math.max(0, syls.findIndex((s) => toneOf(s) > 0));
  const original = toneOf(syls[pos]);
  const out: string[] = [];
  for (let tone = 1; tone <= 4 && out.length < want; tone++) {
    if (tone === original) continue;
    const next = syls.slice();
    next[pos] = applyTone(syls[pos], tone);
    out.push(next.join(" "));
  }
  return out;
};

export const toneSymbol = (tone: number) => ["·", "ˉ", "ˊ", "ˇ", "ˋ"][tone] ?? "";

/** Quita puntuación y espacios para comparar hanzi. */
export const normHan = (s: string) => s.replace(/[\s，。！？、,.!?；;：:“”"'（）()]/g, "");

/** Similitud 0–1 por subsecuencia común más larga. */
export const similarity = (a: string, b: string): number => {
  const x = [...a];
  const y = [...b];
  if (!x.length || !y.length) return 0;
  const dp = Array.from({ length: x.length + 1 }, () => new Array<number>(y.length + 1).fill(0));
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      dp[i][j] = x[i - 1] === y[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[x.length][y.length] / Math.max(x.length, y.length);
};

export const normEn = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Similitud de frases en inglés por palabras (F1). */
export const wordF1 = (said: string, target: string): number => {
  const a = normEn(said).split(" ").filter(Boolean);
  const b = normEn(target).split(" ").filter(Boolean);
  if (!a.length || !b.length) return 0;
  const bag = new Map<string, number>();
  for (const w of b) bag.set(w, (bag.get(w) ?? 0) + 1);
  let hit = 0;
  for (const w of a) {
    const n = bag.get(w) ?? 0;
    if (n > 0) {
      hit++;
      bag.set(w, n - 1);
    }
  }
  if (!hit) return 0;
  const p = hit / a.length;
  const r = hit / b.length;
  return (2 * p * r) / (p + r);
};
