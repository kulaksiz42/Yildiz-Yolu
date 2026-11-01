# Yıldız Yolu — Oynanış v0.5

**Tarih:** 1 Kasım 2026

## İncelenen Neo Star Soccer referansı
- https://neostarsoccer.com/
- https://github.com/oknkeles/neostarsoccer-site
- Kullanıcının depoya yüklediği `neostarsoccer-site-main.zip`

Upstream README: repo yalnızca **yayınlanmış derlenmiş oyun dosyalarını** barındırıyor. Paket React/JS modülleri ve CSS çıktıları içeriyor; özgün geliştirici kaynak deposu değil. Depo ağacında bir LICENSE dosyası bulunmadı. Oyunun kullanım koşulları yazılım, tasarım, ad ve içeriği hak sahibine atfediyor. Bu nedenle üçüncü taraf JS/CSS/karakter/stadyum varlıkları kopyalanmadı. Kullanıcı tarafından konmuş ZIP dosyası **çalışan Yıldız Yolu derlemesine dahil edilmedi**. Kamuya açık depoda üçüncü taraf ZIP dağıtımının ayrıca izin bakımından gözden geçirilmesi önerilir.

## Tamamlanan özgün geliştirmeler
- Altı aşamalı karakter akışı: ad-soyad ve lakap; ülke/lig; mevki; güçlü ayak, ten, saç ve forma rengi; karakter; başlangıç kulübü.
- Üç ayrı localStorage kariyer yuvası: `yildizyolu_slots_v1`. Eski `yildizyolu_cinematic_v2` kaydı korunarak ilk yuvaya taşınır, üzerine yeni kariyer yazılması onay gerektirir ve ek yedek alınır. Yeni kayıtlar eski anahtarı değiştirmez.
- Canlı 2D radar: oyuncu, kale, top, rakip, takım arkadaşı, pas uçuşu.
- Manuel pas hedefi seçimi (`HEDEF SEÇ`); otomatik yönlü pas ve geri pas korunur.
- Sert şut / plase / aşırtma için ayrı uçuş yüksekliği, hız, hata ve kaleci okuma katsayıları. Bunlar hâlâ **basitleştirilmiş oyun fiziğidir**.
- Kaleciye şut yönüne göre tepki durumu; gerçek rig'li kaleci animasyonu yok.
- Ekranlar bağımsız, harici runtime/Three.js eklenmedi.

## Test
- `node --check src/logic.js` ve `python3 build.py` başarılı.
- Yerel Playwright Chromium, 390×844 ve 2D fallback: **28/28** v0.5 akış kontrolü geçti.
- Eski kariyer kaydı ve ayrı yuva testi: **6 kontrol başarılı**.
- Pas hedefi, çift pas, geri pas, aşırtma şut, top kapma, savunma, frikik ve sonuç görüldü.
- WebGL gerçek 3D çizimi bu sandbox tarayıcısında doğrulanamadı; gerçek iPhone Safari GPU/FPS testi yapılmadı.
- Yeni GitHub Actions Playwright smoke testi ilk çalıştırma sonucu ayrıca izlenmeli; burada çalıştığını varsayma.

## Sonraki iş
1. Gerçek iPhone Safari 3D kare hızı ve kumanda gecikmesi.
2. Rigged/GLB animasyonlu futbolcu: izinli/CC0 varlık seçimi, GLTFLoader ya da motor portu, animasyon geçişleri.
3. Kaleci sıçrama animasyonu, top seken fiziği, şut/duvar etkileşimi.
4. Sürekli maç sahneleri ve çoklu pozisyonlar; sonra hoca/şehir/haber/transfer derinliği.
