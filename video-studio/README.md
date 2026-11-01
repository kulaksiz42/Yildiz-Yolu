# Kulaksız Video Studio — Çalışan MVP (v0.1)

**Hikâye -> Canvas animasyon önizleme -> Playwright kareleri -> FFmpeg MP4 -> panelde video -> yayın takvimi.**

Bu sürüm *gerçekten* video render eder. Dört orijinal çizim şablonu içerir: `survival`, `explainer`, `whatif`, `backyard`. Bu şablonlar, aşağıda bağlantısı verilen projelerdeki formatlardan esinlenmiş **bağımsız, sıfırdan yazılmış örneklerdir**. Tam Blender sahnesi, Remotion motoru, 66 stil veya otomatik AI senaryo üretimi henüz entegre değildir. Sosyal medya yayınları da **kasıtlı olarak kapalıdır**; zamanlama yalnız takvim kaydıdır.

## 1. Hızlı çalıştırma

Gerekli: Node 20+, Python 3.9+, FFmpeg/ffprobe, Python Playwright, Playwright Chromium tarayıcısı, ses için espeak (alternatif olarak ElevenLabs anahtarı).

```bash
cd video-studio
python3 -m pip install playwright pillow
python3 -m playwright install chromium
export STUDIO_PASSWORD='buraya-en-az-10-karakter-guclu-sifre'
node server.mjs
```

Windows PowerShell:

```powershell
cd video-studio
py -m pip install playwright pillow
py -m playwright install chromium
$env:STUDIO_PASSWORD = 'buraya-guclu-sifre-yazin'
$env:PYTHON_BIN = 'python'
node server.mjs
```

Ardından `http://127.0.0.1:4173` adresini aç. `STUDIO_HOST=127.0.0.1` varsayılanı paneli yalnız yerel bilgisayarda açar. Dış erişim gerekiyorsa HTTPS ters proxy ve güvenli kimlik doğrulama yapılandırması gerekir; doğrudan internete açmayın.

**Sistem varsayılan şifre içermez.** `.env.example` açıklama içindir; uygulama `.env` dosyasını otomatik okumaz. Ortam değişkenlerini terminalden ayarla. `data/`, `output/` ve `.env` Git'e eklenmez.

### Video oluşturma

1. Giriş yap, **Yeni video** seç.
2. Konu ve formatı yaz. Boş ses metninde örnek bir Türkçe taslak oluşturulur.
3. Önizleme düğmesiyle sahneleri izle.
4. **Render** düğmesine bas. Sunucu Python Playwright ile Canvas karelerini yakalar; FFmpeg H.264 MP4 üretir. `espeak` mevcutsa ses ekler.
5. `MP4` düğmesinden sonucu aç. Sesli dosya yerel `output/` klasörüne kaydedilir.
6. Düzenle ekranından tarih atarsan takvimde görünür; **henüz otomatik paylaşılmaz.**

## 2. Testler

```bash
npm run check               # Node söz dizimi + 6 test
python3 scripts/smoke.py    # Kimlik doğrulama + hikâye + 8sn 540x960 MP4 + ffprobe
```

Smoke test, Firefox/Safari değil Chromium kullanan Playwright gerektirir. Linux üzerinde sistem Chromium'u `/usr/bin/chromium` varsayılmıştır; farklıysa `BROWSER_BIN=/your/path` ile değiştir.

## 3. Klasörler

- `server.mjs`: şifreli yerel panel, JSON veri saklama, render işleri ve dosya sunma.
- `public/app.js`, `public/index.html`, `public/style.css`: responsive yönetici paneli.
- `public/draw.js`: tüm kareleri deterministik üreten orijinal Canvas çizim motoru.
- `public/preview.html`, `public/preview.js`: tarayıcıda animasyon önizleme.
- `scripts/story.mjs`: biçimler, sahneler ve veri doğrulama.
- `scripts/render.py`: Playwright ekran kareleri + yerel/isteğe bağlı ElevenLabs ses + FFmpeg.
- `docs/OPEN_SOURCE.md`: incelenen 10 rehberin durum ve lisans notları.
- `docs/ROADMAP.md`: AI senaryo, gerçek 3D, kelime zamanlaması, sosyal medya entegrasyonu.

## 4. Önemli sınırlar

- `backyard` şu an Canvas ile çizilmiş **2.5D** animasyondur, Blender veya tam 3D değildir.
- Önizlemede altyazı karelerin sahne zamanına bağlıdır; **kelime bazında ElevenLabs Forced Alignment** henüz yoktur.
- Yerel `espeak` Türkçe ses kalitesi temel seviyededir, ücretsiz ses örneğidir. ElevenLabs kullanmak için `ELEVENLABS_API_KEY` ve `ELEVENLABS_VOICE_ID` ortam değişkenleri gerekir; ücret/limitler size aittir.
- Otomatik video fikri veya senaryo üretimi bu MVP'de çevrimiçi AI çağrısı yapmaz; Claude Code projeyi geliştirmek için `CLAUDE.md` dosyasını kullanabilir.
- `YouTube`, `Instagram` ve `X` bağlantıları taslak plan; gerçek API jetonları, OAuth, yeniden deneme, onay ve kayıtlama geliştirilmeden paylaşım yapılmaz.
- Üretim sunucusuna açmadan önce kalıcı veritabanı, job queue, oturum yönetimi, HTTPS, yedekleme ve token şifrelemesi gereklidir.

## 5. Kaynaklar

Fikir kaynağı rehberlere ve kullanım/lisans notlarına `docs/OPEN_SOURCE.md` dosyasından ulaş. Başka projelerin kaynak kodları bu depoya kopyalanmadı; gerekirse ayrı bağımlılıklar olarak sürüm ve lisans doğrulamasıyla eklenmeli.

## Lisans

Bu klasördeki özgün prototip kodu için kullanım izni kullanıcıya aittir. Üçüncü taraf bağımlılık ve içeriklerin kendi lisansları ayrıca geçerlidir. Dış projelerden kod alınmamıştır.


## v0.2 — Ortak zaman çizelgesi + render sonrası kalite denetimi

- `public/timeline.js` görüntü ve ses olayları için tek zaman çizelgesi sağlar. Ele alınan kelime grubu konuşmaya göre değişir. TTS olarak ElevenLabs `/with-timestamps` kullanılırsa karakter zamanları kelimeye dönüştürülüp `source=elevenlabs` olarak kaydedilir; eSpeak veya sessiz renderda kaynak `estimated` olur ve **kesin** kelime eşleşmesi iddia edilmez.
- Her başarılı render ayrıca `output/<id>.timeline.json`, `.quality.json`, `.contact.jpg` üretir. QA kare hash, temel akış/kodek/çözünürlük/süre/ses ve boş kare örneklemesini içerir. Görüntü kompozisyonu ve ses estetiğini AI henüz değerlendirmez; son kontrol insanındır.
- Panelde **Kalite raporu** düğmesi bulunur. Yetkili kullanıcı `/api/videos/<id>/quality`, `/timeline`, `/contact` uç noktalarını açabilir.
- Python için `pillow` da gerekir. Çıktılar `.gitignore` ile depoya eklenmez.
- Claude Code geliştirme rehberi: `docs/CLAUDE_CODE_HANDOFF.md`; yeniden kullanılabilir beceri: `.claude/skills/video-studio/SKILL.md`.
