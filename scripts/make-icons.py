#!/usr/bin/env python3
"""Render the I-5 "panel" app icon, splash and Android adaptive icon layers.

The design is the `.splsvg` icon in prototype/i5-install-app-prototype.html: a navy
square, a gold outer frame, a thin white inner frame and "I-5" in Montserrat SemiBold.
Navy and gold are read from Brand in src/constants/theme.ts, so after the brand gold
changes there, run this again:

    python3 scripts/make-icons.py

Needs Pillow and node_modules (for the Montserrat TTFs).
"""

import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"
FONTS = ROOT / "node_modules" / "@expo-google-fonts" / "montserrat"
SS = 4  # supersampling factor for smooth edges

theme = (ROOT / "src" / "constants" / "theme.ts").read_text()


def brand(name: str) -> str:
    return re.search(rf"\b{name}: '(#[0-9A-Fa-f]{{6}})'", theme).group(1)


NAVY = brand("navy")
GOLD = brand("gold")
WHITE = "#FFFFFF"


def font(weight: str, px: float) -> ImageFont.FreeTypeFont:
    path = FONTS / weight / f"Montserrat_{weight}.ttf"
    return ImageFont.truetype(str(path), round(px))


def rgba(hex_color: str, opacity: float = 1.0) -> tuple:
    h = hex_color.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), round(255 * opacity))


def frame(draw, x, y, size, stroke, color):
    """An SVG-style stroked square: the stroke is centered on the edge."""
    o, i = stroke / 2, stroke / 2
    draw.rectangle([x - o, y - o, x + size + o, y + size + o], fill=color)
    draw.rectangle([x + i, y + i, x + size - i, y + size - i], fill=(0, 0, 0, 0))


def spaced_text(img, cx, baseline, text, fnt, spacing, color):
    """Centered text with CSS-style letter spacing, drawn on its own layer."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    widths = [fnt.getlength(ch) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, baseline), ch, font=fnt, fill=color, anchor="ls")
        x += w + spacing
    img.alpha_composite(layer)


def panel(img, ox, oy, scale, color_gold=GOLD, color_white=WHITE, white_opacity=0.55):
    """Draw the panel's frames and "I-5" (viewBox 0 0 120 120) at offset/scale."""
    u = lambda v: v * scale
    gold = Image.new("RGBA", img.size, (0, 0, 0, 0))
    frame(ImageDraw.Draw(gold), ox + u(28), oy + u(28), u(64), u(3.2), rgba(color_gold))
    img.alpha_composite(gold)
    inner = Image.new("RGBA", img.size, (0, 0, 0, 0))
    frame(ImageDraw.Draw(inner), ox + u(38), oy + u(38), u(44), u(1.5), rgba(color_white, white_opacity))
    img.alpha_composite(inner)
    spaced_text(img, ox + u(60), oy + u(67), "I-5", font("600SemiBold", u(17)), u(1), rgba(color_white))


def save(img, name, size, mode="RGBA"):
    img = img.resize(size, Image.LANCZOS)
    if mode == "RGB":
        img = img.convert("RGB")
    img.save(OUT / name, optimize=True)
    print(f"wrote assets/images/{name} {size[0]}x{size[1]}")


def square(px, background=None):
    return Image.new("RGBA", (px * SS, px * SS), rgba(background) if background else (0, 0, 0, 0))


# App icon: full-bleed navy square, no alpha (the App Store rejects icons with alpha).
img = square(1024, NAVY)
panel(img, 0, 0, 1024 * SS / 120)
save(img, "icon.png", (1024, 1024), "RGB")

# Favicon for web.
img = square(48, NAVY)
panel(img, 0, 0, 48 * SS / 120)
save(img, "favicon.png", (48, 48), "RGB")

# Android adaptive icon. The launcher shows the middle 72 of 108 dp, so the 120-unit
# viewBox maps onto that middle two-thirds. The gold frame stays inside the safe circle.
scale = 1024 * SS * (72 / 108) / 120
offset = 1024 * SS * (18 / 108)
save(square(1024, NAVY), "android-icon-background.png", (1024, 1024), "RGB")
img = square(1024)
panel(img, offset, offset, scale)
save(img, "android-icon-foreground.png", (1024, 1024))
img = square(1024)
panel(img, offset, offset, scale, color_gold=WHITE)
save(img, "android-icon-monochrome.png", (1024, 1024))

# Splash: the icon, "I-5 Install" and the gold tagline, laid out like the prototype's
# .splash (132pt icon, 14pt gaps, 24pt bold name, 12pt uppercase tagline). It sits on
# the navy splash background, so the icon's navy square needs no fill of its own.
# Sizes are in points; app.json's imageWidth must match SPLASH_W.
SPLASH_W, PT = 300, 4 * SS  # rendered at 4x, so 1200 px wide
name_font = font("700Bold", 24 * PT)
tag_font = font("600SemiBold", 12 * PT)
icon_pt, gap = 132, 14
name_top = icon_pt + gap
name_base = name_top + name_font.getmetrics()[0] / PT
tag_top = name_top + 24 * 1.2 + gap
tag_base = tag_top + tag_font.getmetrics()[0] / PT
height = round(tag_top + 12 * 1.2)

img = Image.new("RGBA", (SPLASH_W * PT, height * PT), (0, 0, 0, 0))
cx = SPLASH_W * PT / 2
panel(img, cx - icon_pt * PT / 2, 0, icon_pt * PT / 120)
spaced_text(img, cx, name_base * PT, "I-5 Install", name_font, 0.02 * 24 * PT, rgba(WHITE))
spaced_text(img, cx, tag_base * PT, "CUSTOM DECOR · INSTALLED RIGHT", tag_font, 0.16 * 12 * PT, rgba(GOLD))
save(img, "splash-icon.png", (SPLASH_W * 4, height * 4))
