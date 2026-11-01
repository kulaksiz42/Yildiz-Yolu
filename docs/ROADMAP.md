# Yıldız Yolu — Geliştirme öncelikleri

Bu liste, kayıtlı GitHub kaynaklarıyla doğrulanan V2 temel sürümden başlar.

## Kaynak bütünlüğü

- [x] GitHub özel deposu açıldı.
- [x] V2 başlangıç `index.html` aktarıldı.
- [x] Düzenlenebilir `src/logic.js`, `src/template.html` ve derleme betiği eklendi.
- [ ] Claude Checkpoint 001 ZIP'i geldiğinde içeriği karşılaştır ve kontrollü olarak entegre et.
- [ ] Claude Checkpoint 002 kodu olmadan tamamlandı varsayma.

## Öncelik sırası

1. **P0:** Mevcut V2'de karakter adı kaybı ve aynalı kamera sorunlarını doğrudan kaynakta test edip düzelt. Checkpoint 001'in aynı çözümünü kaynak ZIP gelince referans al.
2. **P1:** Sinematik hoca görüşmesinde karakterlerin üstündeki diyalog paneli ve kamera açıları.
3. **P1:** Futbolcunun ten/saç/forma seçimlerini tüm sahnelerde koru.
4. **P1:** Top fiziğini kare sayısına değil gerçek zaman farkına bağla; 30/60/120 Hz karşılaştır.
5. **P1:** Sezon sonu, güvenli kayıt ve geri yükleme yolları.
6. **P2:** Kaliteli 3D insan karakteri, animasyonlar, top ve kaleci fiziği.
7. **P2:** Türkiye/İngiltere/İspanya bazlı özgün kariyer olayları ve ülke verileri.
8. **P2:** Gerçek kulüp/stadyum verilerini hak ve doğruluk kontrolü ile birleştir.

## Her tamamlanan iş için kabul ölçütü

- Kaynak sürüm ve değişiklikler commit'e kaydedildi.
- `build.py` çıktı üretiyor.
- Tarayıcı/console hatası denetlendi.
- Oyuncu oluşturma → hoca görüşmesi → maç → kariyer ekranına dönüş akışı bozulmadı.
- Gerçek iPhone/Safari denenmediyse özellikle belirtiliyor.
