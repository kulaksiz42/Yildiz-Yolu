# Claude Code için teknik devir paketi — Kulaksız Video Studio

**Mevcut GitHub:** https://github.com/kulaksiz42/Yildiz-Yolu
**Proje klasörü:** `video-studio/`  — futbol oyunu dosyalarını asla silme/değiştirme.
**Son güncelleme:** 2026-11-02

## Tek cümlelik hedef
Kullanıcı Türkçe olarak hikâye konusunu seçsin; sistem özgün senaryo/shotlist, onaylı storyboard, sürekli aynı kalan karakterler, deterministik 2D/3D animasyonlar, seslendirme, kelime senkronlu altyazı, kalite kontrol, MP4 ve kapak üretsin; ancak kullanıcının yayın onayı ve gerçek API yetkileri olmadan sosyal medyaya hiçbir şey göndermesin.

## Gerçek durum — kodu çalıştırarak doğrula
- `server.mjs`: Node.js ile yazılmış şifreli, yerel-only admin paneli (`STUDIO_PASSWORD`, varsayılan `127.0.0.1:4173`); **Next.js değil**.
- `public/draw.js`: dört özgün Canvas demo türü: survival, explainer, whatif, backyard. `StudioDraw.render(canvas,video,t)` ile rasgele kare çizimi.
- `public/timeline.js`: **ortak deterministik sahne/kelime saati**. `StudioTimeline.build` ve `at`; ElevenLabs zamanları varsa `source=elevenlabs`, yoksa `source=estimated`. Tahminleri kesin ses hizalaması gibi pazarlama.
- `scripts/render.py`: Playwright browser + H.264 FFmpeg; ElevenLabs `/with-timestamps` API (anahtar varsa), yoksa yerel eSpeak. Render edilmiş `.timeline.json` dosyasını üretir.
- `scripts/quality.py`: her render sonrası teknik QA + `.contact.jpg` ve `.quality.json`; boş kare, örnek çeşitliliği, akış, süre ve deterministik aynı kare SHA kontrolü. **AI estetik eleştirisi henüz yok**; ses kalitesi insan tarafından dinlenmeli.
- Panelden hazır videonun kalite raporu ve contact sheet'i görülebilir. Takvim henüz GERÇEK yayına göndermez.
- `npm run check` (Node testleri), `python scripts/smoke.py` (giriş, 8 saniye MP4, gerçek QA ve timeline); ci ortamında Playwright Chromium/eSpeak/FFmpeg ve `pip install playwright pillow` gerekir.

## Kanıt ve üretim sözleşmesi
1. Her animasyon yalnızca `t` parametresinden çizilsin: `seek(t)`/`render(...,t)`; timer, CSS transition, frame-dependent mutable state ve `Math.random()` YASAK. Seeded noise kullan.
2. Tek veri kaynağı: hikâye + beat'ler + ses kaydından zaman damgaları + `timeline.json`. Tüm sahne, altyazı ve efektler aynı saate göre çalışsın. Alt yazı tipografisi telefon boyutunda okunur olsun.
3. Gerçek ElevenLabs zaman bilgisi karakter düzeyinden kelimeye dönüştürülür ve metin/timing uyuşmazsa `estimated`e dönülür. Yerel eSpeak için gerçek hizalama istiyorsan önce ücretsiz yerel WhisperX/aeneas gibi seçeneklerin TR uyumluluğunu test et; asla tahmini zamanlamayı ölçülmüş olarak etiketleme.
4. Bir video için `brief.md`, `style_guide.md`, `shotlist.md`, `timeline.json`, `contact.jpg`, `quality.json`, `poster.jpg`, `final.mp4` ve teslim raporu hedefle. Her dosyanın ne zaman gerçekten var olduğunu doğrula.
5. Claude görsel eleştirisi **ek** kapıdır: her beat için still, 6'lı contact sheet, 12 ardışık karelik hareket testi, 360px telefon okunabilirliği, 2 kez ardışık loop, `seek(t)` hash kontrolü. Kritik üç kusuru **timestamp + kanıt + minimum lokal düzeltme** olarak bul ve düzelt. Görsel AI analizi başarı garantisi değildir.
6. Yayın idempotent olmalı: Instagram, YouTube, X ayrı kayıt/kimlik, erişim izni, retry/backoff, 21:00 Europe/Istanbul kuyruğu; başarılı platforma ikinci paylaşım yapılmaz. **Bu modül bugün bağlı değil.**

## Dış kaynaklar — fikir ve kontrollü entegrasyon, kör kopyalama yok
- 3D kesit bahçe / Blender: https://github.com/Theoxmotion/whatif-3d-studio
- 3D survival ve stickman: https://github.com/Theoxmotion/story-video-studio
- Canvas stilleri: https://github.com/cth9191/animate
- Remotion/SVG 2D kısa video: https://github.com/kelano86/what-if-animation
- 66 film stili (her stilin asset lisansını ayrıca incele): https://github.com/lemomo-ai/lemo-opuscar
- Motion sözlüğü (çoklu animasyon isimleri): https://github.com/showheyohtaki/motion-prompt
- Özgün karakter rig / p5.js: https://github.com/JohnHeibel/ClaudeAnimationBase
- Uzun form müzik video mimarisi; doğrudan kod kopyalamadan önce lisans teyidi: https://github.com/JohnHeibel/PDoomVideo
- İlk gönderideki explainer deposu erişilemiyordu: `Theoxmotion/explainer-reel-studio`; mevcut değilse başka repo varsayma.
- ElevenLabs gerçek zaman damgalı TTS: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps/
- Claude Code skills: https://code.claude.com/docs/en/skills
- Claude Code `CLAUDE.md`: https://code.claude.com/docs/en/memory
- Motion animasyon: Remotion `spring()` https://www.remotion.dev/docs/spring ; fakat ilk etapta mevcut Canvas motoru korunmalı.

## Sıradaki bağımsız çalışma işleri (öncelik sırasıyla)
P0 — Mevcut v0.2'yi kendi bilgisayarında/CI'da çalıştır. Timeline'da ses-kare kaymasını ölç, özellikle özel `script`, boş script, uzun Türkçe metin, noktalama, ElevenLabs ile eSpeak farklılıkları, 8-90 saniye ve render başarısızlıkları. Testleri güçlendir. Windows PowerShell yönergelerini güncelle.
P1 — Onaylı beat sheet + sahne başına keyframe + örnek kontakt sayfa ve `brief/style/shotlist` disk verileri, düzenleme ekranı. Kullanıcı onayı olmadan uzun render başlatma.
P1 — AI eleştirmeni isteğe bağlı bağla: görsel model referanslı frame analiz edip 3 kusuru raporlasın; API yoksa `manual_review_required` göster. Yanlış "otomatik kalite onayı" yazma.
P2 — Kapalı-form spring(t), beat-senkron ses, high/low MP4, 1080x1920/1080x1080/1920x1080; oran değiştirmek salt crop değil kompozisyon yeniden düzenleme olsun.
P2 — `renderers/` içinde Canvas mevcut kalırken deneysel Remotion/Three.js/Blender ayrı adaptörleri; modül başına bağımsız test, açık lisans ve gerekli binary'ler raporlanmalı.
P3 — Node panelini güvenli SQL, kalıcı job queue, token encryption ile Next.js'e kontrollü geçiş; gerçek OAuth ve paylaşım en sona. Önce sandbox/test hesapları.

## Claude Code yetkileri ve güvenlik
- Github bağlantısını bu sohbetten Claude Code'a otomatik aktaramayız. Kullanıcı kendi cihazında `git clone` + `gh auth login` veya git credential manager ile **kendi oturumunda** bağlantı sağlamalı. Token/parolayı sohbet, log, issue veya repoya ASLA yazma.
- Her iş için `feat/...` branch aç, orijinal `main` ve futbol oyunu korunur; değişiklikleri sadece `video-studio/` ile sınırla. Önerilen diff'i, test sonuçlarını ve PR bağlantısını sun. Yüksek riskli işlemler (silme, force push, gerçek sosyal medya paylaşımı) kullanıcı açık onayı gerektirir.
- Yeni bağımlılıklar, GitHub reposu ya da curl | bash scriptleri güvenilir kabul edilmez; lisans, maintainer, sürüm ve güvenlik kontrolü yap.
- Uzun otomasyonlarla döngüye girme: en çok 3 düzeltme turu, bütçe ve süre kontrolü; hata durumunda başarı iddiası yerine kanıt içeren blokaj raporu. Gereksiz token/GPU tüketiminden kaçın.

## İlk Claude Code komutu
```
cd Yildiz-Yolu/video-studio
claude
/video-studio
```
Alternatif serbest görev: `CLAUDE.md ve docs/CLAUDE_CODE_HANDOFF.md dosyalarını oku. Önce npm run check ve python scripts/smoke.py çalıştır. Hataları düzelt, P0 testlerini genişlet, mevcut motoru bozmadan contact sheet kalite kontrolünü ve ses senkronunu doğrula; yeni branch + PR + gerçek test sonuçlarıyla raporla.`
