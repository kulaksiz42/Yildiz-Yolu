# Claude Code: Kulaksız Video Studio geliştirme talimatları

Sen bu depodaki çalışan video stüdyosunu geliştiriyorsun. **Önce sistemi çalıştır, test sonuçlarını gör; çalışmayan şeyi çalışıyor diye raporlama.** Kullanıcı Türkçe yönetim paneli istiyor; içeriklerin özgün olması önemli. Başka kanalların ayırt edici tasarımlarını birebir kopyalama.

## Sabit kurallar

1. Eski `Yildiz-Yolu` futbol oyunu klasörlerini değiştirme veya silme. Çalışma alanın `video-studio/`.
2. `.env`, OAuth refresh token, API key, özel medya ve `data/`, `output/` dosyalarını asla GitHub'a commit etme.
3. Yayın bağlantısı doğrulanmadıysa takvim kaydını asla `published` yapma.
4. Yeni özellikten sonra `npm run check` ve mümkünse `python3 scripts/smoke.py` çalıştır. Geçmeyen test varsa nedenini ve çözümü not et.
5. `public/draw.js` ve Python Playwright frame renderer aynı Canvas kodunu kullanır. Yeni stil eklerken hem önizleme hem MP4'ü test et.
6. Kullanıcı onaylı senaryo, kahraman, stil ve storyboard aşamaları ekle; yüksek maliyetli render'ı en sona bırak.
7. Kalite kapıları: MP4 dosya mevcut, 9:16, ses var mı, hata/kesik görüntü, yaklaşık loudness, kelime zamanlama kontrolü, 10 saniyelik örnek klip.
8. Ücretsiz plan kısıtlarını ve ticarî kullanım lisanslarını açıkça belirt. "Tamamen $0" garantisi verme.

## Hedef modüler mimari

- `script-engine`: Claude Code üzerinden onaylı hikâye ve beat şeması; kaynak/doğruluk kontrolü.
- `renderers/canvas`: mevcut sıfırdan yazılmış dört stil; ileride `cth9191/animate` entegrasyonu lisans kontrolleriyle.
- `renderers/three`: `Theoxmotion/story-video-studio` formatından **fikir alarak** özgün 3D survival ortamı; real Three.js/Cannon ile.
- `renderers/blender`: isteğe bağlı Blender cutaway 3D (doğrudan kullanıcının GPU/CPU'su).
- `renderers/remotion`: SVG 2D motora geçiş, kullanım/lisans uygunluğu teyit edilerek.
- `voice`: yerel TTS varsayılan, ElevenLabs opsiyon; `/with-timestamps` karakter hizalamalarını kelimeye çevir.
- `composition`: müzik ve efekt lisansı, LUFS ölçümü, FFmpeg ve ffprobe çıktı kontrolleri.
- `publishing`: ayrı OAuth bağlantıları, token yenileme, API rate-limit, idempotent job kuyrukları, başarısız yayın için tekrar deneme. TikTok kullanıcının talebi olmadan otomatik bağlanmaz.
- `dashboard`: v0.1 yerel Node web arayüzü; daha sonra Next.js + veritabanı migrasyonu yapılabilir.

## Rehberler

Önce `docs/OPEN_SOURCE.md` ve `docs/ROADMAP.md` oku. Dış kaynakların kodunu körü körüne kopyalama; lisansını, fonksiyonunu ve mevcut sürümünü doğrula.

## Bir sonraki Claude görevi

"Projeyi çalıştır, dört Canvas stilini MP4 olarak örnekle, 9:16 kaliteyi doğrula; ardından sahne bazlı düzenleyici ve ses-kelime zamanlaması ekle. Mevcut paneli bozma. Tam test raporu, ücretsiz/ücretli bağımlılıklar listesi ve GitHub PR ile bitir."
