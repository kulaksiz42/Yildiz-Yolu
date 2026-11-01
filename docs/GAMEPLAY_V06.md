# Yıldız Yolu v0.6 — 3D Futbolcu / Animasyon Ara Sürümü
Tarih: 1 Kasım 2026

## Uygulanan değişiklikler
- Özgün, prosedürel anatomik karakter ağı: geniş omuzlar, dar bel, futbolcu oranlarına yakın baş, ayrı kollar/bacaklar.
- `latheGeo`: eğrisel torso, kol, bacak, konç ve saç poligon yüzeyleri; WebGL1 buffer'larında yeniden kullanılır.
- `segmentMatrix`: iki eklem arasındaki segmenti 3B matrisle yönlendirir; koşu sırasında diz ve dirsek koordinatları hesaplanır.
- Forma, şort, yaka, dikiş çizgileri, küçük yüz ayrıntıları, krampon ve saç seçenekleri.
- Şut anında oyuncunun `kick` pozuna geçmesi; kalecinin atış yönüyle uyumlu sağ/sol yatması.
- Uzak karakterlerde basitleştirilmiş LOD (mesafeye göre daha az çizim); daha yakın maç kamerası.
- Neo Star Soccer derleme ZIP'i güncel GitHub dalından kaldırıldı. Önceki commit geçmişindeki kopya otomatik silinmiş olmaz.

## Test durumu
- Yerel `node --check` ve bağımsız HTML üretimi başarılı.
- Önceki v0.5 Playwright Chromium oynanış kontrolleri: **28/28 geçti**.
- Yerel **sahte WebGL bağlamı** ile test: 11 geometri buffer'ı, ~20 bin çizim komutu; geçersiz/sonsuz matris ve vertex bulunmadı. Sahte bağlam gerçek ekran görüntüsü veya FPS kanıtı **değildir**.
- `tests/rig-audit.js`: geometri vertexleri, normal vektörleri ve segment matrislerini GPU olmadan doğrular.
- Otomatik GitHub CI: kaynak, tarayıcı smoke, geometri kontrolleri; sonuçları Actions sayfasında izleyin.
- Gerçek WebGL görüntüsü, donanım iPhone Safari GPU/FPS, ısınma ve farklı cihaz testleri henüz yapılmadı.

## Görsel gerçekçilik sınırı
Bu sürüm hâlâ düşük poligonlu, kendi ürettiğimiz 3D karakterler kullanır. Ne Neo Star Soccer'dan ne de başka bir oyundan model/kod kopyalanmıştır. Foto-gerçekçiliğe yaklaşmak için:
1. Lisansı doğrudan doğrulanmış humanoid GLB/FBX, PBR doku, UV ve kemik rig'i edinin.
2. GLB/animation loader ve Blender/optimizasyon pipeline'ı kurun; mobil için LOD ve asset boyutu ölçün.
3. Koşu, yürüme, şut, pas, müdahale, kaleci dalışı için klipler arasında blend implementasyonu.
4. Sahada sabit FPS, GPU belleği ve Safari gerçek cihaz testi yapın.

## Aday açık varlık kaynakları
- Kenney — https://kenney.nl/support (varlık sayfalarında CC0, model/marka kullanımı ayrı değerlendirilir).
- Quaternius Ultimate Animated Character Pack — https://quaternius.com/packs/ultimateanimated.html (eski paketin CC0 lisansını indirilen sürüm bazında teyit edin).
- Khronos glTF Sample Assets — https://github.com/KhronosGroup/glTF-Sample-Assets (lisans modeller arasında değişir).

**Henüz haricî GLB/FBX modeli oyuna yüklenmedi.** Üçüncü taraf ZIP'in Git geçmişinden bütünüyle temizlenmesi ayrı ve geçmişi yeniden yazan bir işlem olur; bu turda uygulanmadı.
