import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { buzz, sfx } from "@/lib/audio";
import { colors, radius } from "@/theme";

type BtnProps = {
  label: string;
  onPress?: () => void;
  tone?: "primary" | "secondary" | "danger" | "ghost" | "gold";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  right?: ReactNode;
};

const TONES = {
  primary: { bg: colors.bamboo, edge: colors.bambooDark, fg: colors.white },
  secondary: { bg: colors.white, edge: colors.line, fg: colors.skyDark },
  danger: { bg: colors.red, edge: colors.redDark, fg: colors.white },
  gold: { bg: colors.gold, edge: colors.goldDark, fg: colors.ink },
  ghost: { bg: "transparent", edge: "transparent", fg: colors.inkSoft },
};

export function Button({ label, onPress, tone = "primary", disabled, style, small, right }: BtnProps) {
  const c = disabled ? { bg: colors.locked, edge: colors.lockedDark, fg: colors.inkSoft } : TONES[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        sfx("tap");
        buzz("tap");
        onPress?.();
      }}
      style={({ pressed }) => [
        s.btn,
        {
          backgroundColor: c.bg,
          borderBottomColor: c.edge,
          borderColor: tone === "secondary" ? colors.line : "transparent",
          paddingVertical: small ? 8 : 14,
          transform: [{ translateY: pressed && !disabled ? 3 : 0 }],
          borderBottomWidth: pressed && !disabled ? 1 : tone === "ghost" ? 0 : 4,
        },
        style,
      ]}
    >
      <Text style={[s.btnText, { color: c.fg, fontSize: small ? 14 : 16 }]}>{label}</Text>
      {right}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const body = [s.card, style];
  if (!onPress) return <View style={body}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [body, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Progress({ value, color = colors.bamboo, height = 14, track = colors.line }: { value: number; color?: string; height?: number; track?: string }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: "hidden" }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: "100%", backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.h1, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.body, style]}>{children}</Text>;
}

export function Chip({ icon, label, color = colors.ink }: { icon: string; label: string | number; color?: string }) {
  return (
    <View style={s.chip}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ color, fontWeight: "800", fontSize: 15 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1.5,
  },
  btnText: { fontWeight: "800", letterSpacing: 0.4 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderBottomWidth: 4,
    padding: 16,
  },
  h1: { fontSize: 26, fontWeight: "900", color: colors.ink },
  body: { fontSize: 16, lineHeight: 23, color: colors.inkSoft },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 6 },
});
