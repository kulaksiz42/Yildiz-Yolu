# Yıldız Yolu v0.8 — İskelet animasyonlu futbolcu maç entegrasyonu

**1 Kasım 2026.** Kaynak paketler: kullanıcının `yildiz-yolu-futbolcu-paketi.zip` (Claude, 22 kemik / 6 klip) ve `Yıldız-Yolu-3D-Futbolcu-Paketi.zip` (Kimi, 53 kemik / 4 klip).

## Bu turda gerçekten canlıya entegre edilenler

- **Claude'un 22 kemikli GLB futbolcusu**, yerel `assets/rig/footballer.glb` dosyasında; 6 kemik animasyonu GLB içinden okunur: `idle`, `run`, `pass_r`, `pass_l`, `shoot_r`, `shoot_l`.
- **Three.js r147, GLTFLoader ve SkeletonUtils** CDN olmadan `assets/rig/lib/` altında; orijinal telif/MIT bildirimleri korunur.
- Maç kontrol panelinde **`3D MODEL: AÇ`** düğmesi. Tıklandığında model ve motor yüklenir, tek Three.js sahnesinde futbol sahası, kaleler, top, takım arkadaşları ve rakip oyuncular çizilir. Yeniden tıklayınca eski WebGL motoruna geri dönülür.
- Eski maç simülasyonu, kamera takip hedefi, kariyer kaydı, pas/geri pas, şut, kaleci ve maç sonucu kodu değiştirilmedi. `window.YYRigSnapshot()` yalnızca **okunan** bir durum sağlar.
- Aynı model SkeletonUtils ile ayrı iskeletlerle klonlanır. Bir oyuncunun animasyonu diğer oyuncuya geçmez. Her oyuncunun forma, ten, saç vb. materyali bağımsız hazırlanır.
- Kamera top havadayken topu, diğer zamanlarda kontrollü futbolcuyu yumuşak şekilde izler. Pas/şut olunca futbolcunun ilgili tek atımlık iskelet klibi tetiklenir.
- Animasyon GLB klipleri gerçek fakat top fizik motoru ile temas anına kadar *milisaniye seviyesinde* senkronize edilmedi; v0.8'de topu maç mantığı hareket ettirmeye devam eder.
- Kalecinin GLB dalış klibi olmadığından mevcut GLB kaleci `idle` hareketindedir; kaleci kurtarış sonucu mevcut oyun mantığında kalır. Bu model görünümü ile kurtarış animasyonu arasındaki fark sonraki geliştirmedir.

## Sınırlamalar / beklentiler

- **Kimi'nin 53 kemikli daha ayrıntılı GLB modeli canlı oyuna dahil edilmedi.** Paketi ayrı bir laboratuvar karşılaştırması olarak tutuyoruz. Canlı oyuna aktarmadan önce büyük mobil çizim maliyeti, 4 klibin ayağa temas uyumu ve genel kalite incelenmeli.
- Canlı beta yalnızca `match` ekranında yeni GLB motorunu kullanır. Başlık, karakter oluşturma, hikâye ve kariyer merkezi hâlâ eski 3D görselleştirmeyi kullanır.
- Geçici çözüm olarak varsayılan motor ile yeni motor ayrı canvas/bağlamlara sahiptir, ancak aynı anda **ikisi çizilmez**; yeni motor sahayı, topu ve karakterleri tek Three.js sahnesinde çizer. Eski bağlam bellekte bulunabilir ve iPhone GPU belleğini etkileyebilir. Yeni sürümde tek motor mimarisine geçiş planlanmalıdır.
- Fiziği ve maç mantığını daha iyi bağlamak için vuruş kontaktı, ayak-balon korelasyonu, ileri/geri rotasyon ve kaleci kurtarış klipleri geliştirilecektir.
- Telefon Safari, FPS, cihaz ısısı ve landscape düzeni fiziksel cihazda test edilmedi. Varsayılan mod **eski 3D** olarak kalır; beta isteğe bağlıdır.
- Üçüncü taraf oyun kodu/varlığı (Neo Star Soccer vb.) bu entegrasyonda kullanılmadı.

## Gerçekten test edilenler

1. `tests/test_rig_assets.py`: GLB imzası, 22 iskelet eklemi, altı klip, kendi içinde animasyon kanalları, yerel Three.js dosyaları, projeye eklenen bridge ve HTML yüklemesi.
2. `node --check assets/rig/bridge.js`: JS sözdizimi.
3. `tests/test_rig_webgl.py`: GitHub Actions Ubuntu Chromium/SwiftShader ortamında port 8766 üzerinden **gerçek Three.js WebGL sahnesi**; 8 animasyonlu model, 102 draw call, sorunsuz geçiş ve eski motora geri dönüş. Bu GPU telefonu **temsil etmez**.
4. `tests/smoke.py` ve `tests/test_story_v07.py`: önceki maç ve kariyer akışları (kayıt, pas, geri pas, şut, hikâye sonuçları).
5. `tests/rig_v08_preview.png`: sadece CI sırasında oluşturulan örnek ekran görüntüsü; GitHub Actions `rig-webgl-preview` artifact olarak alınabilir.

## Kaynaklar

- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js SkeletonUtils: https://threejs.org/docs/pages/module-SkeletonUtils
- Three.js v147 MIT lisansı: https://github.com/mrdoob/three.js/blob/r147/LICENSE
- Kullanıcıdan yüklenen Claude paketinin `LISANS.md` ve `TEST_RAPORU.md`: modelin sıfırdan üretildiği, üçüncü taraf futbol modeli kullanılmadığı beyanı.
