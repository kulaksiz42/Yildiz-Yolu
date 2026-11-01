#!/usr/bin/env python3
"""Yıldız Yolu tek HTML derleyicisi. Harici Python paketi gerektirmez."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "src" / "template.html"
SCRIPT = ROOT / "src" / "logic.js"
OUTPUT = ROOT / "index.html"
MARKER = "@@INLINE_GAME_SCRIPT@@"

def main():
    html = TEMPLATE.read_text(encoding="utf-8")
    js = SCRIPT.read_text(encoding="utf-8")
    if html.count(MARKER) != 1:
        raise SystemExit("HATA: HTML şablonunda tek bir script yer tutucusu olmalı.")
    if not js.strip():
        raise SystemExit("HATA: Oyun JavaScript dosyası boş.")
    OUTPUT.write_text(html.replace(MARKER, js), encoding="utf-8")
    print(f"Üretildi: {OUTPUT} ({OUTPUT.stat().st_size} bayt)")

if __name__ == "__main__":
    main()
