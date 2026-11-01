---
name: video-studio
description: Kulaksız Video Studio için mevcut sistemi koruyarak güvenli geliştirme, render, QA ve PR iş akışı.
---

# Kulaksız Video Studio development skill

Read `CLAUDE.md`, `docs/CLAUDE_CODE_HANDOFF.md`, `docs/ROADMAP.md`, and `README.md` before editing. Use the user's concrete task; do not take over the project or deploy unrequested features.

1. Inspect `git status`, ensure correct `video-studio` scope and make a new `feat/` branch. Never delete football game code or force-push.
2. Run `npm run check`. If prerequisites exist, run `python scripts/smoke.py`. Record failures before changing source.
3. Identify the narrowest cause and patch in the existing Canvas/Playwright/FFmpeg architecture. For scenes, subtitles, audio and FX, rely on the shared timeline.
4. Test at least one deterministic frame hash, sample contact sheet, empty/special-character narration and actual audio stream; distinguish estimated vs measured word timings.
5. Do not label an aesthetic review as automatic unless a real image-capable model examined the contact sheet and emitted timestamped evidence. QA checks alone do not prove aesthetics.
6. Only suggest new frameworks after verifying license and clear reason (Remotion, Three.js, Blender, p5.js); avoid adopting all dependencies at once.
7. Deliver change summary, commands/results, screenshots/contact sheet and a PR. Stop before real posting or deleting content until explicit approval.

Production style: original Turkish scripts, phone-first contrast, readable captions, intentional 2-4s story beats, no generic gradient title screens as a default, do not mimic third-party trademarks/characters.
