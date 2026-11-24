import { ComponentType, Ref, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { getCharData } from "@/content/hanzi";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz } from "@/lib/audio";
import { colors } from "@/theme";
import { Button } from "../ui";
import { buildTraceHtml } from "./trace-html";
import type { ExProps } from "./types";

type TR = Extract<Ex, { t: "trace" }>;

type Handle = { injectJavaScript: (js: string) => void };
// Los tipos de react-native-webview 14 colapsan a `never` bajo React 19; se tipan solo las props usadas.
const Web = WebView as unknown as ComponentType<{
  ref?: Ref<Handle>;
  originWhitelist: string[];
  source: { html: string };
  onMessage: (e: WebViewMessageEvent) => void;
  javaScriptEnabled?: boolean;
  scrollEnabled?: boolean;
  overScrollMode?: string;
  style?: object;
}>;

export function Trace({ ex, auto }: ExProps<TR>) {
  const { t } = useT();
  const ref = useRef<Handle>(null);
  const html = useMemo(() => buildTraceHtml(ex.ch, getCharData(ex.ch)), [ex.ch]);
  const [mistakes, setMistakes] = useState(0);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { type: string; mistakes?: number };
      if (m.type === "mistake") {
        buzz("bad");
        setMistakes((x) => x + 1);
      }
      if (m.type === "done") auto({ ok: true, soft: true, note: (m.mistakes ?? 0) > 4 ? `${ex.ch} · ${ex.pinyin}` : undefined });
    } catch {
      /* mensaje ajeno */
    }
  };
  const cmd = (c: string) => ref.current?.injectJavaScript(`handle(${JSON.stringify(c)});true;`);

  return (
    <View style={{ gap: 12, flex: 1 }}>
      <Text style={s.prompt}>{t("ex_trace")}</Text>
      <Text style={s.sub}>
        {ex.pinyin} · {ex.meaning}
      </Text>
      <View style={s.board}>
        <Web
          ref={ref}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={onMessage}
          javaScriptEnabled
          scrollEnabled={false}
          overScrollMode="never"
          style={{ backgroundColor: "transparent", flex: 1 }}
        />
      </View>
      <Text style={s.hint}>{t("ex_trace_hint")}</Text>
      <View style={s.row}>
        <Button small tone="secondary" label={`👁 ${t("ex_watch")}`} onPress={() => cmd("animate")} style={{ flex: 1 }} />
        <Button small tone="secondary" label={`↺ ${t("ex_reset")}`} onPress={() => cmd("reset")} style={{ flex: 1 }} />
      </View>
      {mistakes > 0 && <Text style={s.hint}>✗ {mistakes}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  sub: { fontSize: 18, color: colors.bambooDark, fontWeight: "700" },
  board: { height: 340, borderRadius: 20, overflow: "hidden" },
  hint: { fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  row: { flexDirection: "row", gap: 10 },
});
