#!/usr/bin/env python3
"""Build the 1200x630 share card: scripts/og.svg, rendered to og.png.

Run from the repo root:  python3 scripts/og.py && rsvg-convert -w 1200 -h 630 scripts/og.svg -o og.png
The mark and the product icons are inlined from assets/, so the card always matches the site.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SANS = "'Helvetica Neue', Inter, Arial, sans-serif"
MONO = "Menlo, 'JetBrains Mono', monospace"

# (icon file, label) for the panel on the right, three columns.
TILES = [
    ("flisk-cli", "Flisk CLI"),
    ("fliskos", "FliskOS"),
    ("run-my-agents", "Run My Agents"),
    ("put-my-page-online", "Pages"),
    ("citable", "Citable"),
    ("readme-checker", "README Score"),
    ("helpdock", "Helpdock"),
    ("flisk-tools", "Flisk Tools"),
    ("build-me-an-app", "Build Me an App"),
    ("flisk-inference", "Flisk Inference"),
    ("readme-diagram", "README Diagram"),
    ("devex-roadmap", "DevEx Roadmap"),
]


def inline(path: Path, prefix: str, x: float, y: float, size: float) -> str:
    """Return an <svg> element for an icon file, ids prefixed so gradients do not clash."""
    src = path.read_text()
    src = re.sub(r"<title>.*?</title>", "", src, flags=re.S)
    src = re.sub(r'id="([^"]+)"', lambda m: f'id="{prefix}-{m.group(1)}"', src)
    src = re.sub(r"url\(#([^)]+)\)", lambda m: f"url(#{prefix}-{m.group(1)})", src)
    src = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{prefix}-{m.group(1)}"', src)
    # Drop width/height/role/aria on the root and place it.
    head, rest = src.split(">", 1)
    vb = re.search(r'viewBox="([^"]+)"', head).group(1)
    return f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{vb}">{rest}'


def main() -> None:
    parts = []
    parts.append(f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1410"/>
      <stop offset="0.55" stop-color="#08090c"/>
      <stop offset="1" stop-color="#060709"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.12" cy="0.05" r="0.6">
      <stop offset="0" stop-color="#22c55e" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#22c55e" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22c55e" stop-opacity="0.15"/>
      <stop offset="0.45" stop-color="#22c55e" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#22c55e" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#101216"/>
      <stop offset="1" stop-color="#0b0c0f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
""")
    # Left column: mark + name, headline, line, pills, rule, domain.
    parts.append(inline(ROOT / "assets/favicon.svg", "mark", 72, 64, 64))
    parts.append(f'<text x="154" y="109" font-family="{SANS}" font-size="40" font-weight="700" fill="#ffffff" letter-spacing="-0.5">Flisk</text>')
    parts.append(f'<text font-family="{SANS}" font-size="76" font-weight="700" fill="#ffffff" letter-spacing="-2">'
                 '<tspan x="68" y="282">Everything</tspan><tspan x="68" y="364">we build.</tspan></text>')
    parts.append(f'<text font-family="{SANS}" font-size="27" fill="#9aa3ad">'
                 '<tspan x="72" y="420">Every product, plugin, template</tspan>'
                 '<tspan x="72" y="456">and example, on one page.</tspan></text>')
    x = 72
    for label in ("Products", "MCP servers", "Templates"):
        w = 34 + len(label) * 11.2
        parts.append(f'<rect x="{x}" y="484" width="{w:.0f}" height="44" rx="22" fill="#14161a" stroke="#2a2e35"/>')
        parts.append(f'<text x="{x + w / 2:.1f}" y="512.5" text-anchor="middle" font-family="{SANS}" font-size="19" font-weight="500" fill="#e8eaed">{label}</text>')
        x += w + 12

    # Right panel with a grid of product icons.
    px, py = 600, 64
    parts.append(f'<rect x="{px}" y="{py}" width="640" height="620" rx="18" fill="url(#panel)" stroke="#2a2e35"/>')
    parts.append(f'<rect x="{px + 14}" y="{py + 14}" width="170" height="30" rx="15" fill="#16191e" stroke="#2a2e35"/>')
    parts.append(f'<circle cx="{px + 32}" cy="{py + 29}" r="5" fill="#22c55e"/>')
    parts.append(f'<text x="{px + 46}" y="{py + 35}" font-family="{SANS}" font-size="15" font-weight="500" fill="#d5d9de">The Flisk catalog</text>')
    cols, cw, rh = 3, 192, 100
    gx, gy = px + 30, py + 74
    for i, (icon, label) in enumerate(TILES):
        c, r = i % cols, i // cols
        tx, ty = gx + c * cw, gy + r * rh
        parts.append(f'<rect x="{tx}" y="{ty}" width="{cw - 14}" height="{rh - 14}" rx="12" fill="#121418" stroke="#22262c"/>')
        parts.append(inline(ROOT / f"assets/icons/{icon}.svg", f"i{i}", tx + 14, ty + 12, 40))
        parts.append(f'<text x="{tx + 14}" y="{ty + 73}" font-family="{SANS}" font-size="15" font-weight="500" fill="#c9ced4">{label}</text>')

    # Rule and domain, over the panel like the sibling cards.
    parts.append('<rect x="72" y="552" width="1060" height="1.5" fill="url(#rule)"/>')
    parts.append(f'<text x="72" y="598" font-family="{MONO}" font-size="28" fill="#f2f4f6">flisk.si</text>')
    parts.append("</svg>\n")
    (ROOT / "scripts/og.svg").write_text("\n".join(parts))


if __name__ == "__main__":
    main()
