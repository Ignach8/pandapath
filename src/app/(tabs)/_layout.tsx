import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useT } from "@/i18n";
import { colors } from "@/theme";

const icon = (e: string) => ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{e}</Text>;

export default function TabsLayout() {
  const { t } = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.bambooDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.line },
        tabBarLabelStyle: { fontWeight: "800", fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tab_learn"), tabBarIcon: icon("🐼") }} />
      <Tabs.Screen name="practice" options={{ title: t("tab_practice"), tabBarIcon: icon("🏋️") }} />
      <Tabs.Screen name="profile" options={{ title: t("tab_profile"), tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
