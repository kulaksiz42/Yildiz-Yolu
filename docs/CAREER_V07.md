# Yıldız Yolu — Kariyer Olayları v0.7

**Kaynak:** Kullanıcının sağladığı `YILDIZ_YOLU_CHECKPOINT_002.zip`, `FUTBOL_VERILERI/HIKAYE_OLAYLARI_TR_52.json` dosyası. Bu paket 52 kurmaca olay içeriyor; **bu sürümde bunların 16 tanesi** entegre edildi.

## Oyun değişiklikleri
- Mevcut karakter oluşturma, 3D maç, joystick, pas ve üç kariyer yuvası korunuyor.
- Kariyer merkezine `KARİYER OLAYI` butonu eklendi; olaylar isteğe bağlı açılıyor, bu yüzden mevcut maç testi akışı kesilmiyor.
- Ülke ve hafta filtresi: Türkiye, İngiltere ve İspanya için yerel antrenman/basın/deplasman olayları; ek ortak kariyer olayları.
- Mevki filtresi: santrfor, stoper, orta saha ve kanat için özel kararlar.
- Her olayda üç yanıtın `coachTrust`, `teamChemistry`, `reputation`, `energy`, `finishing` vb. etkileri oyun kaydına uygulanıyor (0–100 arası).
- Önceden saklanmış `coach`, `team`, `fame`, `shoot`, `energy` alanlarıyla eşleme var; ek ilişkiler `career.storyMetrics` içinde tutuluyor.
- `career.eventsSeen` aynı hikâyenin tekrar açılmasını engelliyor; `career.choiceHistory` kararı sezon, hafta, olay kimliği ve etkiyle saklıyor.
- Mevcut kullanıcı kayıtları için yeni alanlar yoksa çalışma sırasında güvenli varsayılan atanıyor; kayıt yuvalarının anahtarı değişmedi.

## Şu anda dahil OLMAYANLAR
- Paketteki diğer 36 hikâye olayı ve 46 şehir sahnesi.
- 114 kulüp ve 129 gerçek oyuncu adı veri setlerinin oyun seçim sistemine bağlanması.
- Gerçek kulüp armaları, resmi forma görselleri, gerçek futbolcu yüz/ses/animasyonları.
- Tam sezon, lig fikstürü, gerçek transfer modeli ve güncel veri doğrulaması.

Gerçek spor verilerini oyun senaryosuna eklemeden önce sezon doğruluğu ve lisans değerlendirmesi yapılmalıdır. Kaynak paketin kendisinde Fransa/İtalya stadyumlarının teyit gerektirdiği belirtiliyor. **Olaylar kurgusaldır; gerçek teknik direktörlere veya futbolculara atfedilmez.**

## Testler
- `tests/smoke.py` — başlangıç, kayıt yuvası, karakter, maç, radar, kesintisiz pas ve aşırtma şut.
- `tests/test_story_v07.py` — 3 ülke için olay seçimi, hafta filtresi, seçim sonucunun özellikleri güncellemesi, karar günlüğü, hata kontrolü.
- Gerçek iPhone Safari dokunma/GPU testi bu CI ortamında yapılamaz; Playwright Chromium sonuçları iPhone performans kanıtı değildir.
