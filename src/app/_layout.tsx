import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useT } from "@/i18n";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";

/** Espera a que el estado persistido se hidrate antes de decidir si mostrar onboarding. */
const useHydrated = () => {
  const [ok, setOk] = useState(useApp.persist.hasHydrated());
  useEffect(() => {
    const off = useApp.persist.onFinishHydration(() => setOk(true));
    setOk(useApp.persist.hasHydrated());
    return off;
  }, []);
  return ok;
};

export default function RootLayout() {
  const hydrated = useHydrated();
  const onboarded = useApp((s) => s.onboarded);
  const segments = useSegments();
  const { t } = useT();

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!onboarded && !inOnboarding) router.replace("/onboarding");
    if (onboarded && inOnboarding) router.replace("/");
  }, [hydrated, onboarded, segments]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.bamboo} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="lesson/[id]" options={{ gestureEnabled: false, animation: "slide_from_bottom" }} />
        <Stack.Screen name="guide/[id]" options={{ headerShown: true, title: t("guide"), headerStyle: { backgroundColor: colors.cream }, headerShadowVisible: false }} />
        <Stack.Screen name="courses" options={{ headerShown: true, title: "", headerBackTitle: t("tab_learn"), headerStyle: { backgroundColor: colors.cream }, headerShadowVisible: false }} />
        <Stack.Screen name="map/[id]" options={{ headerShown: true, title: "", headerBackTitle: t("courses_title"), headerStyle: { backgroundColor: colors.cream }, headerShadowVisible: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
