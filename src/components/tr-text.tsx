import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { useT } from "@/i18n";
import { colors } from "@/theme";

/** Traducción discreta bajo un texto en inglés. No dibuja nada si no hay traducción o el ajuste está apagado. */
export function Tr({ en, style }: { en: string | undefined; style?: TextStyle }) {
  const { tr } = useT();
  const text = tr(en);
  if (!text) return null;
  return <Text style={[s.tr, style]}>{text}</Text>;
}

/** Igual que Tr, pero plegable: para textos largos (lecturas, charlas). */
export function TrFold({ en }: { en: string | undefined }) {
  const { t, tr } = useT();
  const [open, setOpen] = useState(false);
  const text = tr(en);
  if (!text) return null;
  return (
    <View style={{ gap: 6 }}>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" hitSlop={8}>
        <Text style={s.toggle}>🌐 {open ? t("tr_hide") : t("tr_show")}</Text>
      </Pressable>
      {open ? <Text style={s.trLong}>{text}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  tr: { fontSize: 14, lineHeight: 20, color: colors.inkSoft, fontWeight: "600" },
  trLong: { fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  toggle: { fontSize: 14, fontWeight: "800", color: colors.skyDark },
});
