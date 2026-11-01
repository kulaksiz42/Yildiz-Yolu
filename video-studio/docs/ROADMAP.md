# Gelişim planı ve doğrulanmış durum

## v0.1 — Çalışıyor / yerel MVP

- [x] Şifreli yerel Node.js yönetim paneli; oturum HttpOnly/SameSite, giriş denemesi sınırı.
- [x] Hikâye oluşturma, önizleme, düzenleme, yayın tarihi kaydetme.
- [x] Dört orijinal Canvas çizim biçimi.
- [x] Deterministik Playwright kare yakalama; FFmpeg H.264 MP4 çıktı.
- [x] Yerel espeak TTS veya opsiyonel ElevenLabs TTS.
- [x] `ffprobe` ile doğrulanan 8 saniyelik test video (1 Kasım 2026, yerel test).
- [x] Node testleri ve smoke test betiği.
- [ ] Canlı site, gerçek sosyal medya OAuth, gerçek otomatik 21.00 paylaşımı **yok**.

## v0.2 — Gerçek hikâye stüdyosu

1. Serbest prompt -> Claude hikâye taslağı -> kullanıcı onayı -> storyboard kare onayı.
2. İçerikte yüz/stil tutarlılığı ve sahne rig'i; 3D Three.js, Blender ve Remotion için ayrı motor adaptörleri.
3. ElevenLabs `/with-timestamps` veya forced alignment ile konuşulan kelime bazlı altyazı.
4. Ses miks kontrolü, yüksek kalite MP4 + küçük mobil MP4, kapak görseli, paylaşım metni.
5. Testleri her render için çalıştır; ücretsiz kullanıcılara maliyet izleme.

## v0.3 — Yayın ve operasyon

1. Next.js yönetim paneline / güvenli SQL veritabanına geçiş. Uygulamanın mevcut v0.1 paneli Next.js değildir.
2. Instagram profesyonel hesap izinleri, `/{ig-user-id}/media` + tamamlandıktan sonra `media_publish`, imzalı HTTPS medya URL'si, token yenileme, kota takibi.
3. YouTube OAuth + video upload + `private`/`publishAt`, doğrulama ve gizlilik ayarları.
4. X API ücretlendirme/rate-limit doğrulaması; medya yükleme/yayın entegrasyonu.
5. 21.00 Europe/Istanbul cron/queue; her hesap için ayrı durum; idempotency; kısmi başarısızlıkta yalnız başarısız platformu yeniden dene; günlük hata bildirimi.
6. HTTPS, güvenli şifreli token deposu, yedekleme, günlük kesintisiz servis ve uyarılar.
7. Önce test hesaplarıyla doğrulama; gerçek hesaplar için kullanıcı onayı.

## Yayın güvenlik ilkesi

`planned` = takvim kaydıdır. API platformun olumlu yanıtını ve medya ID'sini doğrulamadan `published` yapılmaz. İşler yeniden çalıştırıldığında daha önce yayımlanan hesaplara aynı gönderi ikinci kez gönderilmez.


## v0.2 ilk teslim — 2026-11-02
- [x] Paylaşılan scene/word timeline: `public/timeline.js`; Canvas önizleme ve MP4 aynı fonksiyonla zamanlanır.
- [x] ElevenLabs `/with-timestamps` çıktısında kelime zamanı; eSpeak için ölçülmüş olduğu iddia edilmeyen tahmini zamanlama.
- [x] Determinism SHA, MP4/ses/format kontrolleri, boş kare örneklemesi, contact sheet JPG, JSON kalite raporu.
- [x] Panelde rapor ve görsel erişimi.
- [ ] AI görsel eleştirmen, gerçek beat onayı ve render öncesi storyboard henüz yok.
- [ ] Üretim yayın servisi hâlâ devre dışı.
- [ ] `docs/CLAUDE_CODE_HANDOFF.md` Claude Code için ayrıntılı görev paketidir.


## v0.3 — Yerel sürüm (2026-11-02)

- [x] Sahne düzenleyicisi, storyboard onayı, sıra değiştirme, 2–12 sahne, 5 kamera planı.
- [x] Göreli sahne ağırlığı, deterministik `seek(t)` ile canlı storyboard kareleri.
- [x] 12/24/30 FPS, 540×960 veya upscale 1080×1920 MP4.
- [x] Render sonrası kurallı sahne uyarıları (çok uzun başlık, uzun/kısa sahne, anlatım yoğunluğu ve plan tekrarı).
- [x] Claude Free sohbetinden JSON storyboard içe aktarma, inceleme zorunluluğu.
- [x] Panel üzerinden kalite detayları; Playwright offline UI testi.
- [ ] Bulut görsel modeli ile gerçek AI Critic, ses duyma/dinleme, sahne için hedefli yeniden render.
- [ ] Native 1080 çizim, karakter rig kütüphanesi, Three.js/Blender/Remotion ayrı adaptörleri.
- [ ] Yayın API'leri, Next.js ve SQL/queue; bunlar sonraki sürümlerdir.
