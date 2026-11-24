#!/usr/bin/env python3
"""Genera los datos de contenido de la app a partir de fuentes abiertas.

Uso:  python3 -I scripts/build-content.py <ruta a complete-hsk-vocabulary> <ruta a tools/node_modules>

Fuentes:
  - complete-hsk-vocabulary (MIT) -> vocabulario HSK 3.0 (lista oficial 2025, etiqueta "newest")
  - CC-CEDICT (CC BY-SA)          -> definiciones en inglés
  - hanzi-writer-data (Arphic PL) -> trazos de caracteres HSK 1-3 para escritura offline
"""
import json, re, sys, os
from pypinyin import lazy_pinyin, Style

src, nm = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, "src", "content", "generated")
os.makedirs(out, exist_ok=True)

words = json.load(open(os.path.join(src, "complete.json"), encoding="utf-8"))


def clean_meaning(ms):
    first = ms[0] if ms else ""
    parts = [p.strip() for p in first.split(";") if p.strip()]
    parts = [re.sub(r"\s*\(Taiwan[^)]*\)", "", p) for p in parts]
    parts = [p for p in parts if not p.startswith("CL:") and not p.startswith("see ")] or parts
    text = "; ".join(parts[:2])
    if len(text) < 14 and len(ms) > 1:
        extra = ms[1].split(";")[0].strip()
        if extra and extra not in text:
            text += "; " + extra
    return text[:70]


JUNK = re.compile(r"^(surname|variant of|old variant|used in|abbr\.|erhua variant|see |also written|Taiwan pr\.|\(dialect\)|archaic)", re.I)


def norm(p):
    return re.sub(r"[\s'\u2019]", "", p).lower()


def pick_form(h, forms):
    """Elige la lectura más común (según pypinyin) y evita apellidos/variantes."""
    want = norm("".join(lazy_pinyin(h, style=Style.TONE)))
    good = [f for f in forms if not JUNK.match((f["meanings"] or [""])[0])]
    for f in good or forms:
        if norm(f["transcriptions"]["pinyin"]) == want:
            return f
    for f in forms:
        if norm(f["transcriptions"]["pinyin"]) == want:
            return f
    return (good or forms)[0]


levels = {i: [] for i in range(1, 8)}
for w in words:
    tags = [t for t in w["level"] if t.startswith("newest-")]
    if not tags:
        continue
    lvl = int(tags[0].split("-")[1])
    form = pick_form(w["simplified"], w["forms"])
    levels[lvl].append(
        {
            "h": w["simplified"],
            "p": form["transcriptions"]["pinyin"],
            "m": clean_meaning(form["meanings"]),
            "pos": (w.get("pos") or [""])[0],
            "f": w.get("frequency", 99999),
        }
    )

total = 0
for lvl, arr in levels.items():
    arr.sort(key=lambda x: x["f"])
    for x in arr:
        del x["f"]
    total += len(arr)
    json.dump(arr, open(os.path.join(out, f"hsk{lvl}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("HSK", lvl, len(arr))
print("total", total)

# --- caracteres HSK 1-3 para escritura offline -----------------------------
chars = set()
for lvl in (1, 2, 3):
    for x in levels[lvl]:
        for c in x["h"]:
            if "一" <= c <= "鿿":
                chars.add(c)
data = {}
missing = []
for c in sorted(chars):
    p = os.path.join(nm, "hanzi-writer-data", c + ".json")
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        data[c] = {"strokes": d["strokes"], "medians": d["medians"]}
    else:
        missing.append(c)
json.dump(data, open(os.path.join(out, "hanzi-1-3.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("chars with stroke data:", len(data), "missing:", len(missing))

# --- librería hanzi-writer embebida para el WebView -------------------------
js = open(os.path.join(nm, "hanzi-writer", "dist", "hanzi-writer.min.js"), encoding="utf-8").read()
with open(os.path.join(out, "hanzi-writer-lib.ts"), "w", encoding="utf-8") as f:
    f.write("// Generado por scripts/build-content.py — hanzi-writer (MIT)\n")
    f.write("export const HANZI_WRITER_JS = " + json.dumps(js) + ";\n")
print("hanzi-writer.min.js bytes:", len(js))

# --- unidades curadas de HSK 1 (se agrega pinyin automáticamente) ------------
PUNCT = {"，": ",", "。": ".", "！": "!", "？": "?", "、": ","}


def py_sentence(h):
    text = h.replace(" ", "")
    parts = lazy_pinyin(text, style=Style.TONE)
    s = " ".join(parts)
    for k, v in PUNCT.items():
        s = s.replace(" " + k, v).replace(k, v)
    return s


known = {x["h"] for lvl in levels.values() for x in lvl}
cur_path = os.path.join(root, "src", "content", "curated", "hsk1.src.json")
cur = json.load(open(cur_path, encoding="utf-8"))
for u in cur["units"]:
    for w in u["words"]:
        if w not in known:
            print("  !! palabra curada no encontrada en HSK:", u["id"], w)
    for s in u.get("sentences", []):
        s["p"] = py_sentence(s["h"])
    for t in u.get("dialogue", []):
        if "h" in t:
            t["p"] = py_sentence(t["h"])
        for o in t.get("options", []):
            o["p"] = py_sentence(o["h"])
json.dump(cur, open(os.path.join(out, "curated-hsk1.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("curated units:", len(cur["units"]))
