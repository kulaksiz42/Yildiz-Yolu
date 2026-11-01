# Sürüm Geçmişi

## V2 GitHub Geliştirme 001 — 1 Kasım 2026

### Düzeltilen hatalar
- Karakter oluşturma ekranında bir mevkiye dokununca ad ve lakap alanlarının boşalması. Seçenek işleyicisi şimdi `persistInputs()` çağırıyor.
- Dünya +X ekseninin kamera projeksiyonunda ters görünmesi. Görünüm matrisi için yatay eksen yönü düzeltildi.
- `flight.t+=.018` nedeniyle top uçuşunun yüksek FPS'de hızlanması. `advanceFlight(dt)` artık top uçuşunu oyun güncelleme döngüsünde, 0.95 saniyelik süre ile hesaplıyor; WebGL render çiziminden bağımsız.

### Özellik
- Karakter oluşturma ekranına beş forma rengi eklendi.
- Seçilen forma rengi kariyer kaydına yazılıyor ve futbolcunun karakter oluşturma, görüşme, merkez ve maç modeline bağlandı.
- Daha önce kaydedilmiş kariyerler `kit` özelliğine sahip olmasalar da geri dönüş rengi kullanılarak açılabilir.

### Test kanıtı
- Yerel Chromium, 390×844 ekran, `page.set_content` ile test: **20/20** işlev/matematik kontrolü geçti.
- Akış: ad/lakap, mevki, görünüş, kulüp, diyalog seçimi, kariyer merkezi, üç pas, maç sonucu ve hafta ilerleme.
- Kamera projeksiyonunda +X sağa gidiyor.
- Top uçuşu matematiği 30/60/120 Hz koşullarında aynı son konumu veriyor.
- JavaScript sözdizimi: `node --check` geçti.
- 390×844 ve 375×667 düzenleri gözden geçirildi.

### Test edilmedi / kısıt
- **WebGL görüntüsü bu test ortamında açılamadı.** Chromium 2D yedek görünüm kullandı. Gerçek 3D çizim, ışık ve kamera kadrajının iPhone'da doğrulanması gerekiyor.
- iPhone Safari ve gerçek GPU performansı, parmakla joystick hissi test edilmedi.
- Mobil yatay görünüm ve 320×568 ekran başlangıçta kaydırma gerektirebilir.
- Checkpoint 001 ve 002'nin kaynakları bu depoda yok, Claude raporuyla birebir eşdeğer olduğu iddia edilmez.

### Bilinen sonraki işler
- Gerçek Safari'de oynanış ve 3D kadraj gözlemi.
- Daha gerçekçi karakter modeli, iskelet animasyonu ve ofis sinematiği.
- Sezon bitişi, geri yükleme ekranı, fizik çarpışmaları ve derin kariyer sistemi.
