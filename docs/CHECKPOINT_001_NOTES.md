# Claude Checkpoint 001 (v0.2.1) — aktarım notu

**Durum: YALNIZCA RAPOR, KAYNAK DOSYALAR HENÜZ BU DEPODA DEĞİL.**
Bu not kullanıcının Claude'dan aldığı metne dayanır; yeni depoya aktarılan V2 kaynaklarının bu düzeltmeleri içerdiği iddia edilmez.

## Claude tarafından bildirilen düzeltmeler

- Karakter oluştururken ad/mevki/renk/saç seçimlerinde adın silinmesi: seçeneklere `persistInputs()` eklendiği belirtildi.
- 3D kameranın x eksenini aynalaması: `look()` düzeltildiği, `cameraFor()` çıkarıldığı belirtildi.
- Yanlış `window.gl` WebGL testinin gerçek kontrolle değiştirildiği bildirildi.

## Bildirilen test

- Chromium 141 + SwiftShader yazılım WebGL üzerinde **25/25 test geçti** raporu.
- 3D sahneler, oyuncu adı, hoca ikinci seçeneği, joystick yönü, maç, hafta geçişi ve sayfa yenilemeyle kaydetme denenmiş.
- Bu testler bu depoda bağımsız olarak yeniden çalıştırılmadı.
- Gerçek iPhone Safari, GPU/FPS, gerçek parmak hissi ve diğer hoca seçenekleri test edilmedi.

## Bildirilen eksikler

- Hoca ofisi diyalog paneli karakter gövdelerini kapatıyor.
- `flight.t+=.018` kareye bağlı top fiziği, yüksek Hz'de hızlanıyor.
- Karakterler basit kutu/küre; rig ve animasyon yok.
- `career.team`, `fame` ve forma seçimi tam kullanılmıyor.
- Sezon 12. hafta sonrasında durmuyor.

## Güvenli sonraki adım

Orijinal `YILDIZ_YOLU_CHECKPOINT_001.zip` geldiğinde dosya farkı ve kayıt anahtarı kontrolü yaparak birleştir. Raporu kaynak kod yerine kullanıp testler geçti iddiasında bulunma.
