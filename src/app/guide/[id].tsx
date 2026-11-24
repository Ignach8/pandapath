import { useLocalSearchParams } from "expo-router";
import { Guide } from "@/screens/guide";

export default function GuideRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Guide unitId={decodeURIComponent(id)} />;
}
