# Gerçek GLB 3D futbolcu deneyi (1 Kasım 2026)

## Bağlantılar

- **Karşılaştırmalı laboratuvar:** https://kulaksiz42.github.io/Yildiz-Yolu/labs/rig-compare.html
- **Maç motoru ile entegrasyon:** https://kulaksiz42.github.io/Yildiz-Yolu/?rig3d=1
- **Varsayılan oyun:** https://kulaksiz42.github.io/Yildiz-Yolu/

## Durum

Canlı kaynaklara **isteğe bağlı** bir Three.js r180 3D gösterim modu eklendi. Var olan `src/logic.js` pas, şut, karar, hikâye, kariyer ve localStorage durumunu yönetmeye devam eder. Yeni JS modülü bunları salt-okunur `window.__YYRIG_SNAPSHOT()` üzerinden tüketir. Yeni mod açılınca eski WebGL1 renderer devre dışı kalır; böylece **birden fazla WebGL context ile aynı anda render yapılmaz**. Eski 2D fallback ve önceden bulunan Claude r147 aç/kapat denemesi ayrı tutulur. `?rig3d=1` durumunda r147 aç/kapat modülü kendini kapatır.

## Gerçek kaynaklar

- **Kimi GLB:** `rigs/models/kimi.glb`, kullanıcı tarafından yüklenen `Yıldız-Yolu-3D-Futbolcu-Paketi.zip` paketinden. Doğrulanan: 53 iskelet kemiği, idle/run/pass/shoot. Kaynak paket bu modelin MakeHuman/MPFB'nin CC0 çekirdek varlıklarıyla oluşturulduğunu beyan ediyor. MPFB'nin tüm üçüncü taraf topluluk varlıkları otomatik olarak CC0 değildir; varlık kökeni paketin beyanıyla sınırlı.
- **Claude GLB:** `rigs/models/claude.glb`, kullanıcı tarafından yüklenen `yildiz-yolu-futbolcu-paketi.zip` paketinden. Doğrulanan: 22 kemik, idle/run/pass_r/pass_l/shoot_r/shoot_l. Üretici tarafından özgün yapım olarak beyan edilmiş.
- **Three.js:** Resmî `mrdoob/three.js` GitHub deposunun **r180** etiketinden `three.core.js`, `three.module.js`, `GLTFLoader.js`, `SkeletonUtils.js`. `rigs/vendor/LICENSE` dosyasındaki MIT lisansı korunmuştur. Bütün Three.js deposunu veya Claude'un geçici klasörünü kopyalamak gerekli değildir.

## Dosyalar

- `labs/rig-compare.html`, `labs/rig-compare.mjs`: iki GLB'yi **aynı WebGL2 sahnesi**, ortak kamera, ışık ve animasyonlarla karşılaştır.
- `rigs/game-rigs.mjs`: ana oyunun güncel durumunu GLB futbolcularla gösteren **deneysel** Three.js render modülü.
- `src/logic.js`, `src/template.html`: sadece opt-in görüntü köprüsü, `?rig3d=1`.
- `tests/test_dual_rig.js`: iki binary GLB yapısını, kemikleri, klip adlarını, çevrimdışı Three paketlerini ve görüntü köprüsünü doğrular.

## Sınırlar ve performans

- Three.js r180 **WebGL2 gerektirir**; yalnız WebGL1 destekleyen cihazlarda bu mod çalışmayabilir, eski oyun kullanılmalıdır.
- Eski WebGL1 saha motoru tek model üretecek düzende değil; bu yüzden yeni mod kendi Three.js sahasını da çizer. Tam stadyum, kaleci dalışı, karakter-top temas zamanı, gol kutlaması ve fotogerçekçi kaplamalar henüz tamamlanmadı.
- Bu oturumda GPU'lu gerçek 3D ekran görüntüsü alınamadı: yerel Playwright tarayıcısı `file://` ve `localhost` erişimini engelledi. Yalnız GLB dosyalarının ikili yapılarını ve otomatik kaynak/normal maç kontrollerini doğruladık. **Gerçek iPhone Safari FPS, görünüm ve dokunma testi henüz yapılmadı.**
- Örnek model sayısını sınırlı tuttuk. Model başına ayrı materyal ve ayrı SkinnedMesh GPU maliyeti yaratır. 11'e 11 için animasyon LOD, culling ve cihaz FPS ölçümü yapılmalı.
- Bir takım arkadaşına pas verildiğinde kontrollü avatar Kimi modeline geçer; önceki oyuncu Claude modeline dönüşür. Bu görsel kimlik değişimini giderecek sabit oyuncu kimliği sistemi henüz eksik.

## Test akışı

1. Laboratuvarda iki futbolcuyu kontrol et: Bekle / Koş / Pas / Şut, mavi/kırmızı forma, düşük/dengeli/yüksek çözünürlük, tek parmakla döndürme ve pinch zoom.
2. Oyunda `?rig3d=1` aç, yeni oyuncu oluştur veya mevcut kayda gir, pas, geri pas ve şut dene.
3. Uyum sorunu olursa URL'den `?rig3d=1` bölümünü kaldır ve normal oyuna dön. Kariyer kayıt anahtarları değişmedi.
4. `node tests/test_dual_rig.js`, `node --check src/logic.js`, `python3 build.py` ve GitHub Actions normal mobil Chromium smoke testlerini çalıştır.

## Lisans ve haklar

Three.js MIT — https://github.com/mrdoob/three.js/blob/r180/LICENSE  
MPFB CC0 çekirdek varlık açıklaması — https://github.com/makehumancommunity/mpfb2/blob/master/LICENSE.ASSETS.md

Yalnız gerekli resmi kütüphane dosyaları dahil edildi. Neo Star Soccer'dan kod veya görsel alınmadı.
