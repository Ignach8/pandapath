import type { DialogueTurn, GuideBlock, L, LessonDef, LessonKind, Sentence, Unit, Word } from "./types";

type Raw = { h: string; p: string; m: string; pos?: string };
type GlossFile = Record<string, string> & { _en?: Record<string, string> };

const LOADERS: Record<number, () => Raw[]> = {
  1: () => require("./generated/hsk1.json"),
  2: () => require("./generated/hsk2.json"),
  3: () => require("./generated/hsk3.json"),
  4: () => require("./generated/hsk4.json"),
  5: () => require("./generated/hsk5.json"),
  6: () => require("./generated/hsk6.json"),
  7: () => require("./generated/hsk7.json"),
};

const GLOSS = require("./gloss-es.json") as GlossFile;
const levelCache: Record<number, Word[]> = {};

export const getLevelWords = (level: number): Word[] => {
  levelCache[level] ??= LOADERS[level]().map((r) => {
    const m: L = { en: GLOSS._en?.[r.h] ?? r.m };
    if (GLOSS[r.h]) m.es = GLOSS[r.h];
    return { id: r.h, h: r.h, p: r.p, m, pos: r.pos, level };
  });
  return levelCache[level];
};

export const HSK_LEVELS = [1, 2, 3, 4, 5, 6, 7];

export const levelLabel = (level: number) => (level >= 7 ? "HSK 7–9" : `HSK ${level}`);

const wordLookup = (() => {
  let map: Map<string, Word> | null = null;
  return (h: string) => {
    if (!map) {
      map = new Map();
      for (const lv of [1, 2, 3]) for (const w of getLevelWords(lv)) map.set(w.h, w);
    }
    return map.get(h);
  };
})();

/** Busca una palabra por su hanzi en los niveles 1–3 (usado por unidades curadas). */
export const findWord = (h: string) => wordLookup(h);

type CuratedUnit = {
  id: string;
  icon: string;
  title: L;
  words: string[];
  sentences: { h: string; p: string; es: string; en: string }[];
  dialogue: ({ who: "panda"; h: string; p: string; es: string; en: string } | { who: "you"; options: { h: string; p: string; es: string; en: string; ok: boolean }[] })[];
  guide: GuideBlock[];
};

const ICONS = ["🐼", "🎋", "🍵", "🏮", "🐉", "🥟", "🌸", "⛰️", "🧧", "🪭"];
const UNIT_SIZE = 8;

const KINDS_AUTO: LessonKind[] = ["learn", "listen", "write", "speak", "test"];
const KINDS_CURATED: LessonKind[] = ["learn", "listen", "write", "speak", "talk", "test"];

const kindTitle: Record<string, L> = {};

const lessonsFor = (unitId: string, kinds: LessonKind[]): LessonDef[] =>
  kinds.map((kind) => ({ id: `${unitId}-${kind}`, kind, title: kindTitle[kind] ?? { en: kind } }));

const unitCache: Record<number, Unit[]> = {};

export const getHskUnits = (level: number): Unit[] => {
  if (unitCache[level]) return unitCache[level];
  const courseId = level >= 7 ? "hsk7" : `hsk${level}`;
  const words = getLevelWords(level);
  const units: Unit[] = [];
  const used = new Set<string>();

  if (level === 1) {
    const cur = (require("./generated/curated-hsk1.json") as { units: CuratedUnit[] }).units;
    for (const c of cur) {
      const ws = c.words.map((h) => findWord(h)).filter((w): w is Word => !!w);
      ws.forEach((w) => used.add(w.h));
      const sentences: Sentence[] = c.sentences.map((s) => ({ h: s.h, p: s.p, m: { es: s.es, en: s.en } }));
      const dialogue: DialogueTurn[] = c.dialogue.map((t) =>
        t.who === "panda"
          ? { who: "panda", h: t.h, p: t.p, m: { es: t.es, en: t.en } }
          : { who: "you", options: t.options.map((o) => ({ h: o.h, p: o.p, m: { es: o.es, en: o.en }, ok: o.ok })) },
      );
      const id = `${courseId}-${c.id}`;
      units.push({
        id,
        courseId,
        index: units.length,
        icon: c.icon,
        title: c.title,
        subtitle: ws.slice(0, 4).map((w) => w.h).join(" · "),
        colorIdx: units.length % 5,
        words: ws,
        sentences,
        dialogue,
        guide: c.guide,
        lessons: lessonsFor(id, KINDS_CURATED),
      });
    }
  }

  const rest = words.filter((w) => !used.has(w.h));
  for (let i = 0; i < rest.length; i += UNIT_SIZE) {
    const chunk = rest.slice(i, i + UNIT_SIZE);
    const n = units.length;
    const id = `${courseId}-a${Math.floor(i / UNIT_SIZE)}`;
    const label = chunk.slice(0, 3).map((w) => w.h).join(" · ");
    units.push({
      id,
      courseId,
      index: n,
      icon: ICONS[n % ICONS.length],
      title: { en: label },
      subtitle: chunk.map((w) => w.h).join(" "),
      colorIdx: n % 5,
      words: chunk,
      sentences: [],
      guide: [],
      lessons: lessonsFor(id, KINDS_AUTO),
    });
  }
  unitCache[level] = units;
  return units;
};

export const setKindTitles = (map: Record<string, L>) => Object.assign(kindTitle, map);
