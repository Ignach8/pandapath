import { useLocalSearchParams } from "expo-router";
import { CourseMap } from "@/screens/map/course-map";

export default function MapRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CourseMap courseId={id} />;
}
