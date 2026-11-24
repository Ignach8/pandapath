import { useLocalSearchParams } from "expo-router";
import { LessonScreen } from "@/screens/lesson";

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LessonScreen lessonId={decodeURIComponent(id)} />;
}
