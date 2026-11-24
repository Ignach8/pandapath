import { findLesson, getCourse, getUnits } from "@/content";
import { hasCharData, isHan } from "@/content/hanzi";
import { getLevelWords } from "@/content/hsk";
import type { Ex, Lang, LessonKind, Sentence, SpeechLang, Unit, Word } from "@/content/types";
import { K, loc, translate } from "@/i18n";
import { applyTone, plain, syllables, toneOf, toneVariants } from "./pinyin";
import { pickOne, sample, shuffle } from "./rand";

const Z: SpeechLang = "zh-CN";
const E: SpeechLang = "en-US";

type Ctx = { lang: Lang; t: (k: K) => string; pool: Word[] };

const isPunct = (s: string) => /^[，。！？、,.!?]+$/.test(s);
const flat = (h: string) => h.replace(/\s+/g, "");

// ---------- helpers de opciones ----------
const meaningOf = (w: Word, c: Ctx) => loc(w.m, c.lang);

const distract = (w: Word, c: Ctx, n: number, key: (x: Word) => string) => {
  const mine = key(w);
  const seen = new Set([mine]);
  const out: Word[] = [];
  for (const x of shuffle(c.pool)) {
    const k = key(x);
    if (!seen.has(k) && x.id !== w.id) {
      seen.add(k);
      out.push(x);
      if (out.length === n) break;
    }
  }
  return out;
};

// ---------- ejercicios de HSK ----------
const exMeaning = (w: Word, c: Ctx): Ex => {
  const opts = shuffle([w, ...distract(w, c, 3, (x) => meaningOf(x, c))]);
  return {
    t: "mc",
    stem: w.h,
    stemSub: w.p,
    say: { text: w.h, lang: Z, auto: true },
    opts: opts.map((x) => ({ label: meaningOf(x, c) })),
    ans: opts.indexOf(w),
    why: `${w.h} · ${w.p} = ${meaningOf(w, c)}`,
    wordId: w.id,
    big: true,
  };
};

const exHanzi = (w: Word, c: Ctx): Ex => {
  const opts = shuffle([w, ...distract(w, c, 3, (x) => x.h)]);
  return {
    t: "mc",
    stem: meaningOf(w, c),
    stemSub: c.t("ex_pick_hanzi"),
    opts: opts.map((x) => ({ label: x.h, sub: x.p })),
    ans: opts.indexOf(w),
    why: `${w.h} · ${w.p}`,
    wordId: w.id,
  };
};

const exListen = (w: Word, c: Ctx): Ex => {
  const opts = shuffle([w, ...distract(w, c, 3, (x) => x.h)]);
  return {
    t: "mc",
    stem: c.t("ex_listen_pick"),
    say: { text: w.h, lang: Z, auto: true, hideText: true },
    opts: opts.map((x) => ({ label: x.h, sub: x.p })),
    ans: opts.indexOf(w),
    why: `${w.h} · ${w.p} = ${meaningOf(w, c)}`,
    wordId: w.id,
  };
};

const exTone = (w: Word, c: Ctx): Ex => {
  const vars = toneVariants(w.p, 3);
  if (vars.length < 2 || syllables(w.p).length > 4) return exListen(w, c);
  const opts = shuffle([w.p, ...vars]);
  return {
    t: "mc",
    stem: c.t("ex_pick_tone"),
    say: { text: w.h, lang: Z, auto: true, hideText: true },
    opts: opts.map((p) => ({ label: p })),
    ans: opts.indexOf(w.p),
    why: `${w.h} · ${w.p}`,
    wordId: w.id,
  };
};

const exPinyinBank = (w: Word, c: Ctx): Ex | null => {
  const ans = syllables(w.p);
  if (!ans.length || ans.length > 4) return null;
  const first = ans[0];
  const alt = applyTone(plain(first), ((toneOf(first) || 1) % 4) + 1);
  const extras = new Set<string>();
  if (alt && !ans.includes(alt)) extras.add(alt);
  for (const x of shuffle(c.pool)) {
    const s = syllables(x.p)[0];
    if (s && !ans.includes(s)) extras.add(s);
    if (extras.size >= 3) break;
  }
  return {
    t: "bank",
    stem: c.t("ex_build_pinyin"),
    say: { text: w.h, lang: Z, auto: true, hideText: true },
    tokens: [...ans, ...extras],
    ans,
    join: " ",
    lang: Z,
    wordId: w.id,
    hint: `${w.h} · ${meaningOf(w, c)}`,
  };
};

const exHanziBank = (w: Word, c: Ctx): Ex | null => {
  const chars = [...w.h].filter(isHan);
  if (chars.length < 2 || chars.length > 4) return null;
  const extras = new Set<string>();
  for (const x of shuffle(c.pool)) {
    const ch = [...x.h].find((k) => isHan(k) && !chars.includes(k));
    if (ch) extras.add(ch);
    if (extras.size >= 2) break;
  }
  return {
    t: "bank",
    stem: meaningOf(w, c),
    tokens: [...chars, ...extras],
    ans: chars,
    join: "",
    lang: Z,
    wordId: w.id,
    hint: w.p,
  };
};

const exMatch = (ws: Word[], c: Ctx): Ex => ({
  t: "match",
  pairs: ws.map((w) => ({ a: w.h, b: meaningOf(w, c), say: w.h })),
  sayLang: Z,
  wordIds: ws.map((w) => w.id),
});

const exTraces = (w: Word, lang: Lang, max = 2): Ex[] => {
  const chars = [...w.h].filter((ch) => isHan(ch) && hasCharData(ch));
  const syl = syllables(w.p);
  const all = [...w.h].filter(isHan);
  return chars.slice(0, max).map((ch) => ({
    t: "trace",
    ch,
    pinyin: syl.length === all.length ? syl[all.indexOf(ch)] : w.p,
    meaning: loc(w.m, lang),
    wordId: w.id,
  }));
};

const exSpeak = (w: Word, c: Ctx): Ex => ({ t: "speak", text: w.h, lang: Z, sub: w.p, meaning: meaningOf(w, c), wordId: w.id });

// ---------- ejercicios con frases ----------
const sentenceTokens = (s: Sentence) => s.h.split(" ").filter((x) => x && !isPunct(x));

const exSentenceBank = (s: Sentence, all: Sentence[], c: Ctx): Ex | null => {
  const tokens = sentenceTokens(s);
  if (tokens.length < 2) return null;
  const extras = new Set<string>();
  for (const o of shuffle(all)) {
    for (const tk of sentenceTokens(o)) if (!tokens.includes(tk)) extras.add(tk);
    if (extras.size >= 2) break;
  }
  return {
    t: "bank",
    stem: loc(s.m, c.lang),
    tokens: [...tokens, ...[...extras].slice(0, 2)],
    ans: tokens,
    join: "",
    lang: Z,
    hint: s.p,
  };
};

const exSentenceMc = (s: Sentence, all: Sentence[], c: Ctx): Ex | null => {
  const others = sample(all.filter((o) => o !== s && loc(o.m, c.lang) !== loc(s.m, c.lang)), 3);
  if (others.length < 2) return null;
  const opts = shuffle([s, ...others]);
  return {
    t: "mc",
    stem: flat(s.h),
    stemSub: s.p,
    say: { text: flat(s.h), lang: Z, auto: true },
    opts: opts.map((o) => ({ label: loc(o.m, c.lang) })),
    ans: opts.indexOf(s),
    why: `${flat(s.h)} · ${s.p}`,
    big: true,
  };
};

const exSentenceSpeak = (s: Sentence, c: Ctx): Ex => ({ t: "speak", text: flat(s.h), lang: Z, sub: s.p, meaning: loc(s.m, c.lang) });

const compact = (xs: (Ex | null | undefined)[]): Ex[] => xs.filter((x): x is Ex => !!x);

// ---------- recetas por tipo de lección ----------
const hskRecipe = (unit: Unit, kind: LessonKind, c: Ctx): Ex[] => {
  const ws = unit.words;
  const ss = unit.sentences;
  switch (kind) {
    case "learn": {
      const out: Ex[] = [];
      for (let i = 0; i < ws.length; i += 3) {
        const chunk = ws.slice(i, i + 3);
        out.push(...chunk.map((w): Ex => ({ t: "intro", word: w })));
        out.push(...shuffle(chunk).map((w) => exMeaning(w, c)));
      }
      out.push(exMatch(sample(ws, 5), c));
      out.push(...sample(ws, 3).map((w) => exHanzi(w, c)));
      out.push(...sample(ws, 2).map((w) => exListen(w, c)));
      return out;
    }
    case "listen":
      return [
        ...sample(ws, 5).map((w) => exListen(w, c)),
        ...sample(ws, 4).map((w) => exTone(w, c)),
        ...compact(sample(ws, 4).map((w) => exPinyinBank(w, c))),
        ...(ss.length ? compact([exSentenceMc(pickOne(ss), ss, c)]) : []),
      ];
    case "write": {
      const traces = ws.flatMap((w) => exTraces(w, c.lang, 1)).slice(0, 4);
      const banks = compact(ws.filter((w) => [...w.h].length >= 2).slice(0, 3).map((w) => exHanziBank(w, c)));
      const sb = compact(sample(ss, 3).map((s) => exSentenceBank(s, ss, c)));
      const fill = traces.length + banks.length + sb.length < 4 ? sample(ws, 4).map((w) => exHanzi(w, c)) : [];
      return [...traces, ...banks, ...sb, ...fill, ...compact(sample(ws, 3).map((w) => exPinyinBank(w, c)))];
    }
    case "speak":
      return [...sample(ws, 5).map((w) => exSpeak(w, c)), ...sample(ss, 2).map((s) => exSentenceSpeak(s, c))];
    case "talk":
      return unit.dialogue
        ? [
            { t: "dialogue", title: loc(unit.title, c.lang), lang: Z, turns: unit.dialogue },
            ...compact(sample(ss, 3).map((s) => exSentenceMc(s, ss, c))),
          ]
        : [];
    default:
      return shuffle([
        ...sample(ws, 4).map((w) => exMeaning(w, c)),
        ...sample(ws, 2).map((w) => exHanzi(w, c)),
        ...sample(ws, 2).map((w) => exListen(w, c)),
        exTone(pickOne(ws), c),
        exMatch(sample(ws, 5), c),
        ...compact([exPinyinBank(pickOne(ws), c)]),
        ...(ss.length ? compact([exSentenceBank(pickOne(ss), ss, c)]) : []),
        ...ws.flatMap((w) => exTraces(w, c.lang, 1)).slice(0, 1),
      ]);
  }
};

// ---------- vocabulario del TOEFL ----------
const vocabRecipe = (unit: Unit, kind: LessonKind, c: Ctx): Ex[] => {
  const ws = unit.words;
  const defOpts = (w: Word) => {
    const opts = shuffle([w, ...sample(ws.filter((x) => x.id !== w.id), 3)]);
    return { opts, ans: opts.indexOf(w) };
  };
  const wordMc = (w: Word): Ex => {
    const { opts, ans } = defOpts(w);
    return {
      t: "mc",
      stem: w.h,
      stemSub: w.p,
      say: { text: w.h, lang: E, auto: true },
      opts: opts.map((x) => ({ label: loc(x.m, c.lang) })),
      ans,
      why: `${w.h} ${w.p} — ${loc(w.m, c.lang)}`,
      wordId: w.id,
      big: true,
    };
  };
  const defMc = (w: Word): Ex => {
    const { opts, ans } = defOpts(w);
    return { t: "mc", stem: loc(w.m, c.lang), opts: opts.map((x) => ({ label: x.h })), ans, why: `${w.h} ${w.p}`, wordId: w.id };
  };
  const clozeOf = (w: Word) => unit.sentences.find((s) => s.m.en === w.h);
  const clozeMc = (w: Word, listen: boolean): Ex | null => {
    const s = clozeOf(w);
    if (!s) return null;
    const { opts, ans } = defOpts(w);
    return {
      t: "mc",
      stem: s.h,
      say: listen ? { text: s.h.replace("___", w.h), lang: E, auto: true } : undefined,
      opts: opts.map((x) => ({ label: x.h })),
      ans,
      why: s.h.replace("___", w.h),
      wordId: w.id,
    };
  };
  const typed = (w: Word): Ex | null => {
    const s = clozeOf(w);
    if (!s) return null;
    const [before, after] = s.h.split("___");
    return { t: "type", stem: "Type the missing word", before, after, ans: [w.h], why: s.h.replace("___", w.h), say: { text: s.h.replace("___", w.h), lang: E } };
  };
  if (kind === "learn") {
    const out: Ex[] = [];
    for (let i = 0; i < ws.length; i += 4) {
      const chunk = ws.slice(i, i + 4);
      out.push(...chunk.map((w): Ex => ({ t: "intro", word: w })), ...shuffle(chunk).map(wordMc));
    }
    return [...out, ...sample(ws, 4).map(defMc)];
  }
  if (kind === "listen") {
    return [
      ...ws.map((w): Ex => {
        const { opts, ans } = defOpts(w);
        return {
          t: "mc",
          stem: "Listen and choose the word you hear.",
          say: { text: w.h, lang: E, auto: true, hideText: true },
          opts: opts.map((x) => ({ label: x.h })),
          ans,
          wordId: w.id,
        };
      }).slice(0, 5),
      ...compact(sample(ws, 4).map((w) => clozeMc(w, true))),
    ];
  }
  return shuffle([...compact(ws.map((w) => clozeMc(w, false))).slice(0, 5), ...compact(sample(ws, 4).map(typed)), ...sample(ws, 2).map(defMc)]);
};

// ---------- API pública ----------
const shuffleMc = (ex: Ex): Ex => {
  if (ex.t !== "mc") return ex;
  const order = shuffle(ex.opts.map((_, i) => i));
  return { ...ex, opts: order.map((i) => ex.opts[i]), ans: order.indexOf(ex.ans) };
};

const allWordIndex = (() => {
  let map: Map<string, Word> | null = null;
  return () => {
    if (!map) {
      map = new Map();
      for (let l = 1; l <= 7; l++) for (const w of getLevelWords(l)) map.set(w.id, w);
    }
    return map;
  };
})();

export type BuiltLesson = { ex: Ex[]; title: string; practice: boolean };

type Extra = { dueIds: string[]; learnedIds: string[]; courseId: string };

const poolFor = (words: Word[]): Word[] => {
  const levels = new Set(words.map((w) => w.level));
  const pool = [...levels].flatMap((l) => getLevelWords(l));
  return pool.length ? pool : getLevelWords(1);
};

const wordsMix = (words: Word[], style: "review" | "listen" | "tones" | "speak" | "write", c: Ctx): Ex[] => {
  switch (style) {
    case "listen":
      return words.map((w) => exListen(w, c));
    case "tones":
      return words.map((w) => exTone(w, c));
    case "speak":
      return words.map((w) => exSpeak(w, c));
    case "write": {
      const traces = words.flatMap((w) => exTraces(w, c.lang, 1)).slice(0, 6);
      const banks = compact(words.map((w) => exHanziBank(w, c))).slice(0, 4);
      return [...traces, ...banks, ...words.slice(0, Math.max(0, 8 - traces.length - banks.length)).map((w) => exHanzi(w, c))];
    }
    default:
      return shuffle(
        words.flatMap((w, i) =>
          i % 3 === 0 ? [exMeaning(w, c)] : i % 3 === 1 ? [exListen(w, c)] : compact([exPinyinBank(w, c) ?? exHanzi(w, c)]),
        ),
      );
  }
};

export const buildLesson = (lessonId: string, lang: Lang, extra: Extra): BuiltLesson | null => {
  const t = (k: K) => translate(lang, k);

  // práctica libre y repaso
  if (lessonId === "review" || lessonId.startsWith("drill:")) {
    const style = lessonId === "review" ? "review" : (lessonId.slice(6) as "listen" | "tones" | "speak" | "write");
    const index = allWordIndex();
    let words = (lessonId === "review" ? extra.dueIds : extra.learnedIds).map((id) => index.get(id)).filter((w): w is Word => !!w);
    if (words.length < 6) {
      const base = extra.courseId.startsWith("hsk") ? getUnits(extra.courseId).flatMap((u) => u.words) : getUnits("hsk1").flatMap((u) => u.words);
      words = [...words, ...base.filter((w) => !words.includes(w))];
    }
    words = sample(words, style === "write" ? 10 : 10);
    const c: Ctx = { lang, t, pool: poolFor(words) };
    const title = lessonId === "review" ? t("review_due") : t(("drill_" + style) as K);
    return { ex: wordsMix(words, style, c), title, practice: true };
  }

  const found = findLesson(lessonId);
  if (!found) return null;
  const { unit, lesson } = found;
  const course = getCourse(unit.courseId);
  const title = `${loc(unit.title, lang)} · ${t(("k_" + lesson.kind) as K)}`;

  if (lesson.ex) return { ex: lesson.ex.map(shuffleMc), title, practice: false };

  if (course.family === "toefl") {
    const c: Ctx = { lang, t, pool: unit.words };
    return { ex: vocabRecipe(unit, lesson.kind, c), title, practice: false };
  }

  const c: Ctx = { lang, t, pool: poolFor(unit.words) };
  return { ex: hskRecipe(unit, lesson.kind, c), title, practice: false };
};

export const lessonKindIcon = (kind: LessonKind): string =>
  ({
    learn: "📚",
    listen: "🎧",
    write: "✍️",
    speak: "🎤",
    talk: "💬",
    test: "🏆",
    reading: "📖",
    listening: "🎧",
    writing: "✍️",
    speaking: "🎤",
    vocab: "📚",
  })[kind];
