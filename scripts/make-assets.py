#!/usr/bin/env python3
"""Genera los efectos de sonido (WAV) y los íconos de la app (panda original)."""
import math, os, struct, wave
from PIL import Image, ImageDraw

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATE = 22050


def tone(freq, dur, vol=0.5, shape="sine", attack=0.005, decay=None):
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        ph = 2 * math.pi * freq * t
        if shape == "sine":
            v = math.sin(ph) + 0.25 * math.sin(2 * ph)
        elif shape == "square":
            v = 1.0 if math.sin(ph) >= 0 else -1.0
            v *= 0.5
        else:
            v = math.sin(ph)
        env = min(1.0, t / attack) * math.exp(-t * (decay if decay else 4.0 / dur))
        out.append(v * env * vol)
    return out


def write(name, samples):
    path = os.path.join(root, "assets", "sounds", name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32000)) for s in samples))
    print(name, os.path.getsize(path), "bytes")


def seq(notes):
    out = []
    for f, d, v, sh in notes:
        out += tone(f, d, v, sh)
    return out


write("correct.wav", seq([(659.25, 0.11, 0.45, "sine"), (880.0, 0.22, 0.45, "sine")]))
write("wrong.wav", seq([(220.0, 0.14, 0.4, "square"), (164.8, 0.26, 0.4, "square")]))
write("tap.wav", tone(900, 0.04, 0.35, "sine", decay=60))
write("complete.wav", seq([(523.25, 0.12, 0.45, "sine"), (659.25, 0.12, 0.45, "sine"), (783.99, 0.12, 0.45, "sine"), (1046.5, 0.4, 0.5, "sine")]))

# ---------------- íconos ----------------
S = 4  # supersampling


def panda(size, bg=None, pad=0.0, mono=False):
    W = size * S
    img = Image.new("RGBA", (W, W), bg or (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = W / 2
    r = W * (0.36 - pad)
    ink = (31, 42, 46, 255) if not mono else (0, 0, 0, 255)
    white = (255, 255, 255, 255)
    # orejas
    for sx in (-1, 1):
        ex, ey, er = c + sx * r * 0.78, c - r * 0.82, r * 0.34
        d.ellipse([ex - er, ey - er, ex + er, ey + er], fill=ink)
    # cabeza
    d.ellipse([c - r, c - r * 0.92, c + r, c + r * 0.92], fill=white if not mono else ink)
    if mono:
        return img.resize((size, size), Image.LANCZOS)
    # manchas de ojos
    for sx in (-1, 1):
        ex, ey = c + sx * r * 0.42, c - r * 0.08
        d.ellipse([ex - r * 0.26, ey - r * 0.34, ex + r * 0.26, ey + r * 0.34], fill=ink)
        d.ellipse([ex - r * 0.1, ey - r * 0.12, ex + r * 0.1, ey + r * 0.08], fill=white)
    # nariz y boca
    d.ellipse([c - r * 0.14, c + r * 0.22, c + r * 0.14, c + r * 0.38], fill=ink)
    d.arc([c - r * 0.22, c + r * 0.3, c, c + r * 0.52], 20, 160, fill=ink, width=int(r * 0.05))
    d.arc([c, c + r * 0.3, c + r * 0.22, c + r * 0.52], 20, 160, fill=ink, width=int(r * 0.05))
    # hoja de bambú
    leaf = (47, 163, 122, 255)
    d.polygon([(c + r * 0.55, c + r * 0.95), (c + r * 1.0, c + r * 0.55), (c + r * 0.95, c + r * 1.05)], fill=leaf)
    return img.resize((size, size), Image.LANCZOS)


assets = os.path.join(root, "assets", "images")
bg = (221, 243, 233, 255)
icon = Image.new("RGBA", (1024, 1024), bg)
icon.alpha_composite(panda(1024, None, 0.0))
icon.convert("RGB").save(os.path.join(assets, "icon.png"))
panda(1024, None, 0.1).save(os.path.join(assets, "android-icon-foreground.png"))
Image.new("RGBA", (1024, 1024), bg).save(os.path.join(assets, "android-icon-background.png"))
panda(1024, None, 0.1, mono=True).save(os.path.join(assets, "android-icon-monochrome.png"))
panda(512, None, 0.0).save(os.path.join(assets, "splash-icon.png"))
panda(96, bg, 0.0).save(os.path.join(assets, "favicon.png"))
print("icons ok")
