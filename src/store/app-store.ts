import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Lang } from "@/content/types";

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 20 * 60 * 1000;
export const HEART_REFILL_COST = 40;

export type Srs = { box: number; due: number; seen: number; wrong: number };
export type Daily = { date: string; xp: number; lessons: number; correct: number; claimed: string[] };

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DAY = 24 * 60 * 60 * 1000;
const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];

type State = {
  ready: boolean;
  onboarded: boolean;
  uiLang: Lang;
  courseId: string;
  dailyGoal: number;
  sound: boolean;
  haptics: boolean;
  showPinyin: boolean;
  slowTts: boolean;
  xp: number;
  gems: number;
  streak: number;
  lastActive: string;
  hearts: number;
  heartsAt: number;
  done: Record<string, number>;
  skipTo: Record<string, number>;
  srs: Record<string, Srs>;
  daily: Daily;
  perfect: number;
  // acciones
  setLang: (l: Lang) => void;
  finishOnboarding: (p: { courseId: string; goal: number }) => void;
  setCourse: (id: string) => void;
  set: (p: Partial<Pick<State, "dailyGoal" | "sound" | "haptics" | "showPinyin" | "slowTts">>) => void;
  refreshHearts: () => void;
  loseHeart: () => void;
  refillHearts: () => boolean;
  grantHeart: () => void;
  completeLesson: (p: {
    lessonId: string;
    xp: number;
    gems: number;
    correct: number;
    total: number;
    wordResults: Record<string, boolean>;
  }) => number;
  jumpTo: (courseId: string, lessonIndex: number) => void;
  claimQuest: (id: string, gems: number) => void;
  touchDaily: () => Daily;
  reset: () => void;
};

const freshDaily = (): Daily => ({ date: todayKey(), xp: 0, lessons: 0, correct: 0, claimed: [] });

const initial = {
  onboarded: false,
  uiLang: "es" as Lang,
  courseId: "hsk1",
  dailyGoal: 20,
  sound: true,
  haptics: true,
  showPinyin: true,
  slowTts: false,
  xp: 0,
  gems: 20,
  streak: 0,
  lastActive: "",
  hearts: MAX_HEARTS,
  heartsAt: 0,
  done: {} as Record<string, number>,
  skipTo: {} as Record<string, number>,
  srs: {} as Record<string, Srs>,
  daily: freshDaily(),
  perfect: 0,
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ready: false,
      ...initial,
      setLang: (uiLang) => set({ uiLang }),
      finishOnboarding: ({ courseId, goal }) => set({ onboarded: true, courseId, dailyGoal: goal }),
      setCourse: (courseId) => set({ courseId }),
      set: (p) => set(p),
      refreshHearts: () => {
        const s = get();
        if (s.hearts >= MAX_HEARTS) return;
        const now = Date.now();
        const gained = Math.floor((now - s.heartsAt) / HEART_REGEN_MS);
        if (gained > 0) {
          const hearts = Math.min(MAX_HEARTS, s.hearts + gained);
          set({ hearts, heartsAt: hearts >= MAX_HEARTS ? 0 : s.heartsAt + gained * HEART_REGEN_MS });
        }
      },
      loseHeart: () => {
        const s = get();
        set({ hearts: Math.max(0, s.hearts - 1), heartsAt: s.hearts >= MAX_HEARTS ? Date.now() : s.heartsAt });
      },
      refillHearts: () => {
        const s = get();
        if (s.gems < HEART_REFILL_COST) return false;
        set({ gems: s.gems - HEART_REFILL_COST, hearts: MAX_HEARTS, heartsAt: 0 });
        return true;
      },
      grantHeart: () => {
        const s = get();
        set({ hearts: Math.min(MAX_HEARTS, s.hearts + 1) });
      },
      touchDaily: () => {
        const s = get();
        if (s.daily.date !== todayKey()) {
          const d = freshDaily();
          set({ daily: d });
          return d;
        }
        return s.daily;
      },
      completeLesson: ({ lessonId, xp, gems, correct, total, wordResults }) => {
        const s = get();
        const daily = s.daily.date === todayKey() ? s.daily : freshDaily();
        const today = todayKey();
        let streak = s.streak;
        if (s.lastActive !== today) {
          const y = todayKey(new Date(Date.now() - DAY));
          streak = s.lastActive === y ? s.streak + 1 : 1;
        }
        const stars = total === 0 ? 3 : correct / total >= 0.95 ? 3 : correct / total >= 0.8 ? 2 : 1;
        const srs = { ...s.srs };
        const now = Date.now();
        for (const [id, ok] of Object.entries(wordResults)) {
          const cur = srs[id] ?? { box: 0, due: 0, seen: 0, wrong: 0 };
          const box = ok ? Math.min(BOX_DAYS.length - 1, cur.box + 1) : 0;
          srs[id] = { box, due: now + BOX_DAYS[box] * DAY, seen: cur.seen + 1, wrong: cur.wrong + (ok ? 0 : 1) };
        }
        set({
          xp: s.xp + xp,
          gems: s.gems + gems,
          streak,
          lastActive: today,
          srs,
          done: { ...s.done, [lessonId]: Math.max(s.done[lessonId] ?? 0, stars) },
          daily: { ...daily, xp: daily.xp + xp, lessons: daily.lessons + 1, correct: daily.correct + correct },
          perfect: s.perfect + (stars === 3 && total > 0 ? 1 : 0),
        });
        return stars;
      },
      jumpTo: (courseId, lessonIndex) =>
        set((s) => ({ skipTo: { ...s.skipTo, [courseId]: Math.max(s.skipTo[courseId] ?? -1, lessonIndex - 1) } })),
      claimQuest: (id, gems) =>
        set((s) => ({
          gems: s.gems + gems,
          daily: { ...s.daily, claimed: [...s.daily.claimed, id] },
        })),
      reset: () => set({ ...initial, daily: freshDaily(), onboarded: false }),
    }),
    {
      name: "pandapath-v1",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useApp.setState({ ready: true });
      },
      partialize: ({ ready: _r, ...rest }) => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) if (typeof v !== "function") out[k] = v;
        return out as never;
      },
    },
  ),
);

export const dueWords = (srs: Record<string, Srs>, now = Date.now()) =>
  Object.entries(srs)
    .filter(([, v]) => v.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
