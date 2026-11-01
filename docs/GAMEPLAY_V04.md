# Oynanış v0.4 — 1 Kasım 2026

## Oynanış
- PAS ile top takım arkadaşına giderken maç sahnesi ve maç anı yeniden oluşturulmaz.
- Kamera topu ve top taşıyıcısını yumuşak biçimde takip eder; 2D yedek görünümde de kamera geçişi yumuşatılır.
- Eski top taşıyıcısı fiziksel konumunda takım arkadaşı olarak kalır; yakınsa (24 m) geriye pas verilmesini sağlar.
- Geri pas için duruma göre ortaya çıkan GERİ PAS düğmesi veya joystick aşağı + PAS kullanılabilir.
- Savunmacılar top uçarken donmaz, pas hattını kapatabilir ve pası kesebilir.
- Dokunmatik pointerdown ve click olaylarının çift tetiklediği istenmeyen ikinci pas engellendi.

## Görseller
- İlkel kutu figür yerine ayrı kol, bacak, diz, çorap, krampon, yüz, forma ayrıntısı ve prosedürel koşu hareketi kullanılıyor.
- Stadyum seyircileri renk gruplarıyla 4 büyük sabit geometri grubunda birleştirildi; tribünlere çevre reklam panoları eklendi.
- Bu prosedürel animasyon gerçek skeletal/GLB rig'li model değildir. Kalite kontrolü fiziksel iPhone cihazında yapılmadı.

## Test
- Yerel Playwright Chromium, 390×844, 2D yedek görünüm: önceki 23/23 ve yeni 13/13 kontrol geçti.
- Pas → alıcıya kontrol → geri pas → şut → savunma → kontra atak → frikik → sonuç akışı işlendi.
- `node --check`: geçti.
- Gerçek cihaz Safari, 3D WebGL görsel doğrulaması, GPU/FPS ölçümü **yapılmadı**.
- Tarayıcı yerel web gezinmesi yönetici engeline takıldığı için gerçek WebGL koşusu bu ortamda doğrulanmadı.

## Sıradaki
- Gerçek iPhone Safari ekran görüntüsü ve FPS.
- CC0 rig'li animasyonlu insan modeli; idle/run/pass/shot/slide animasyonları için glTF/Three.js teknik prototipi.
- Kaleci animasyonu, topun fiziki çarpışma tepkileri, uzun maç simülasyonu, taraftar atmosferi ve sinematik kamera açılarının geliştirilmesi.
