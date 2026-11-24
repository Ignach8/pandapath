export type Lang = "es" | "en" | "zh";
/** Texto localizado: `en` siempre existe y sirve de respaldo. */
export type L = { en: string; es?: string; zh?: string };
export type SpeechLang = "zh-CN" | "en-US" | "es-ES";

export type Word = { id: string; h: string; p: string; m: L; pos?: string; level: number };
export type Sentence = { h: string; p: string; m: L };
export type GuideBlock = { title: L; body: L };
export type DialogueTurn =
  | { who: "panda"; h: string; p: string; m: L }
  | { who: "you"; options: { h: string; p: string; m: L; ok: boolean }[] };

export type Opt = { label: string; sub?: string };
export type Say = { text: string; lang: SpeechLang; auto?: boolean; hideText?: boolean };

export type Ex =
  | { t: "intro"; word: Word }
  | {
      t: "mc";
      stem: string;
      stemSub?: string;
      say?: Say;
      passage?: { title?: string; text: string };
      opts: Opt[];
      ans: number;
      why?: string;
      wordId?: string;
      big?: boolean;
    }
  | { t: "match"; pairs: { a: string; b: string; say?: string }[]; sayLang?: SpeechLang; wordIds?: string[] }
  | {
      t: "bank";
      stem: string;
      say?: Say;
      tokens: string[];
      ans: string[];
      join: "" | " ";
      lang: SpeechLang;
      wordId?: string;
      hint?: string;
    }
  | { t: "type"; stem: string; sub?: string; before?: string; after?: string; ans: string[]; say?: Say; why?: string }
  | { t: "trace"; ch: string; pinyin: string; meaning: string; wordId?: string }
  | { t: "speak"; text: string; lang: SpeechLang; sub?: string; meaning?: string; wordId?: string }
  | {
      t: "essay";
      kind: "email" | "discussion" | "interview";
      stem: string;
      context?: string;
      minWords: number;
      voice?: boolean;
      checks: { label: string; re: string }[];
      model: string;
    }
  | { t: "dialogue"; title: string; lang: SpeechLang; turns: DialogueTurn[] };

export type LessonKind =
  | "learn"
  | "listen"
  | "write"
  | "speak"
  | "talk"
  | "test"
  | "reading"
  | "listening"
  | "writing"
  | "speaking"
  | "vocab";

export type LessonDef = { id: string; kind: LessonKind; title: L; ex?: Ex[] };

export type Unit = {
  id: string;
  courseId: string;
  index: number;
  icon: string;
  title: L;
  subtitle?: string;
  colorIdx: number;
  words: Word[];
  sentences: Sentence[];
  dialogue?: DialogueTurn[];
  guide: GuideBlock[];
  lessons: LessonDef[];
  skill?: "reading" | "listening" | "writing" | "speaking" | "vocab";
};

export type Course = {
  id: string;
  family: "hsk" | "toefl";
  level?: number;
  title: L;
  subtitle: L;
  flag: string;
  wordCount: number;
};
