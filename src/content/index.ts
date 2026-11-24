import { getHskUnits, getLevelWords, levelLabel } from "./hsk";
import { getToeflUnits } from "./toefl";
import type { Course, LessonDef, Unit } from "./types";

export const COURSES: Course[] = [
  ...[1, 2, 3, 4, 5, 6, 7].map(
    (n): Course => ({
      id: `hsk${n}`,
      family: "hsk",
      level: n,
      title: { en: levelLabel(n), zh: levelLabel(n) },
      subtitle: {
        en: ["Beginner", "Elementary", "Upper elementary", "Intermediate", "Upper intermediate", "Advanced", "Proficient (bands 7–9)"][n - 1],
        es: ["Principiante", "Elemental", "Elemental alto", "Intermedio", "Intermedio alto", "Avanzado", "Dominio (bandas 7–9)"][n - 1],
        zh: ["入门", "初级", "初级进阶", "中级", "中高级", "高级", "精通（7–9 级）"][n - 1],
      },
      flag: "🇨🇳",
      wordCount: 0,
    }),
  ),
  {
    id: "toefl",
    family: "toefl",
    title: { en: "TOEFL iBT", zh: "托福 iBT" },
    subtitle: { en: "Reading · Listening · Writing · Speaking", es: "Reading · Listening · Writing · Speaking", zh: "阅读 · 听力 · 写作 · 口语" },
    flag: "🇺🇸",
    wordCount: 16,
  },
];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id) ?? COURSES[0];

export const courseWordCount = (c: Course) => (c.family === "hsk" ? getLevelWords(c.level ?? 1).length : c.wordCount);

export const getUnits = (courseId: string): Unit[] => {
  if (courseId === "toefl") return getToeflUnits();
  const level = Number(courseId.replace("hsk", "")) || 1;
  return getHskUnits(level);
};

export type FlatLesson = { unit: Unit; lesson: LessonDef; index: number };

const flatCache: Record<string, FlatLesson[]> = {};

export const flatLessons = (courseId: string): FlatLesson[] => {
  flatCache[courseId] ??= getUnits(courseId).flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson, index: 0 }))).map((x, i) => ({ ...x, index: i }));
  return flatCache[courseId];
};

export const courseOfLesson = (lessonId: string) => lessonId.split("-")[0];

export const findLesson = (lessonId: string): FlatLesson | undefined =>
  flatLessons(courseOfLesson(lessonId)).find((x) => x.lesson.id === lessonId);

export const totalLessons = (courseId: string) => flatLessons(courseId).length;
