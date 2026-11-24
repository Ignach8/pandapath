import { createElement, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCharData } from "@/content/hanzi";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { colors } from "@/theme";
import { Button } from "../ui";
import { buildTraceHtml } from "./trace-html";
import type { ExProps } from "./types";

type TR = Extract<Ex, { t: "trace" }>;

/** Variante web (vista previa): el mismo HTML dentro de un iframe. */
export function Trace({ ex, auto }: ExProps<TR>) {
  const { t } = useT();
  const frame = useRef<HTMLIFrameElement | null>(null);
  const html = useMemo(() => buildTraceHtml(ex.ch, getCharData(ex.ch)), [ex.ch]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      try {
        const m = JSON.parse(String(e.data)) as { type: string };
        if (m.type === "done") auto({ ok: true, soft: true });
      } catch {
        /* otro mensaje */
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const cmd = (c: string) => frame.current?.contentWindow?.postMessage(JSON.stringify({ cmd: c }), "*");

  return (
    <View style={{ gap: 12 }}>
      <Text style={s.prompt}>{t("ex_trace")}</Text>
      <Text style={s.sub}>
        {ex.pinyin} · {ex.meaning}
      </Text>
      <View style={{ height: 340 }}>
        {createElement("iframe", { ref: frame, srcDoc: html, style: { border: 0, width: "100%", height: 340 }, title: "hanzi" })}
      </View>
      <View style={s.row}>
        <Button small tone="secondary" label={`👁 ${t("ex_watch")}`} onPress={() => cmd("animate")} style={{ flex: 1 }} />
        <Button small tone="secondary" label={`↺ ${t("ex_reset")}`} onPress={() => cmd("reset")} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  sub: { fontSize: 18, color: colors.bambooDark, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10 },
});
