# Oynanış v0.3 — 1 Kasım 2026

## Kaynak
- Canlı: https://kulaksiz42.github.io/Yildiz-Yolu/
- Ana kod: `src/logic.js`
- Derlenen sayfa: `index.html`

## Değiştirildi
1. Joystick'in merkez hesaplaması ve parmak takibi düzeltildi. Ekranın soluna sürükleme X eksenini azaltır; kamera projeksiyonunda dünya sola gider.
2. `PAS` artık şut değildir: top seçilen ileri takım arkadaşına hareket eder; başarılı pasın sonunda kontrol alıcı oyuncuya geçer. Rakip yakındaysa pas kesilebilir.
3. Üç kritik maç anı: atak, savunma, frikik. Savunma sırasında `TOP KAP` ve `KAY` çalışır. Kazanılan top kontra atağa geçer.
4. Savunmacılar hareket ederek oyuncuyu kovalar ve topu kazanabilir. Rakip top taşıyıcı savunma anında ilerler; müdahale için yakınlık önemlidir.
5. Şut gücü, yatay hedef, oyuncu şut özelliği ve rastlantısal sapma sonucunu değiştirir: gol, kurtarış, blok, direk, aut.
6. Pas ve şut uçuşu saniye bazında canlandırılır. 2D fallback sahnesinde de aktif oyuncular dinamik gösterilir.
7. Ekran kontrolü, şut güç çubuğu ve kondisyon göstergesi iyileştirildi; koyu yeşil/neon lime renk şeması kullanıldı.

## Test
- `node --check src/logic.js`: geçti.
- Yerel Playwright Chromium (390×844, 2D fallback): **23/23** kontrol geçti.
- Kontroller: karakter adı, kariyer/hoca görüşmesi, maç, kamera +X yönü, sola joystick, pointer bırakma, pas uçuşu ve oyuncu geçişi, şut uçuşu, savunma, top kapma, kontra atak, frikik, maç sonu, hafta artışı, JS hata yok.
- Tek HTML derlemesi kaynak ve şablonla aynı içeriktedir.
- **Uyarı:** Gerçek WebGL, fiziksel iPhone Safari ve GPU/FPS doğrulaması yapılmadı. Test tarayıcısı WebGL'e erişemedi.
- Kafa/gövde modelleri hâlâ primitive geometri, animasyon ve stadyum henüz profesyonel oyun kalitesinde değildir.

## Sonraki öncelik
- Fiziksel iPhone testindeki joystick ve kamera geri bildirimini işle.
- 3D futbolcu karakteri, koşu/şut animasyonu, kamera ve tribün atmosferini geliştir.
- Daha sonra orta saha ve kaleci senaryoları, maç olayları, kariyer dallanması, transfer ve sezon sonu.
- Three.js/WebGL ve açık kaynak örnekleri analiz edildi; mevcut özel WebGL motorunu bozmamak için bu aşamada yeni çalışma zamanı bağımlılığı eklenmedi.
