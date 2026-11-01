# Yıldız Yolu — Geliştirme öncelikleri

Bu liste, kayıtlı GitHub kaynaklarıyla doğrulanan V2 temel sürümden başlar.

## Kaynak bütünlüğü

- [x] GitHub deposu açıldı ve Pages için herkese açık yapıldı.
- [x] V2 başlangıç `index.html` aktarıldı.
- [x] Düzenlenebilir `src/logic.js`, `src/template.html` ve derleme betiği eklendi.
- [ ] Claude Checkpoint 001 ZIP'i geldiğinde içeriği karşılaştır ve kontrollü olarak entegre et.
- [ ] Claude Checkpoint 002 kodu olmadan tamamlandı varsayma.

## Öncelik sırası

1. **TAMAMLANDI (yerel işlev testi):** İsim kaybı ve aynalı kamera matematiği düzeltildi. Checkpoint 001 kaynak ZIP'i gelirse ayrıca karşılaştır.
2. **P1:** Sinematik hoca görüşmesinde karakterlerin üstündeki diyalog paneli ve kamera açıları.
3. **KISMEN TAMAMLANDI:** Ten ve saç kariyer verisindeydi; forma rengi seçimi ve model çağrıları eklendi. Gerçek WebGL görünüm doğrulaması bekliyor.
4. **TAMAMLANDI (matematik):** Top uçuşu `dt` ile hesaplanıyor; 30/60/120 Hz testleri eşdeğer sonuç verdi. Gerçek GPU animasyonu henüz gözlemlenmedi.
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
