# Pilotta Yönetmen Notları ve Özel Çizim Motoru — Elmanın Besin Döngüsü

**Pilot JSON:** [`../examples/apple-soil.json`](../examples/apple-soil.json). Bunu v0.3+ panelinde **Claude Free taslağını aktar** yoluyla yükleyin. `visual_preset: apple-soil-v1` değeri geçerlidir ve yalnızca `style: backyard` için kullanılır. Mevcut sıradan `backyard` videoları etkilenmez.

## Görsel kimlik / sabit dünya

- Sahneler tek bahçede geçer. Koyu kahverengi toprak, üstte yeşil çimen, arka planda sıcak gökyüzü. Üst toprak ve alt katman renkleri sahne değişince yer değiştirmez.
- Elma: parlak koyu kırmızı, aynı sap, aynı yeşil yaprak. Çürüme, kabuk üzerindeki lekelerin artmasıyla gösterilir; kopuş yaşandığında ölçeği küçülür.
- İkinci plan: toprak kesiti, görsel olarak aydınlatılmış 2.5D vektör illüstrasyon. **Blender, WebGL, fotogerçekçi materyal veya gerçek 3D derinlik iddiası yoktur.**
- Altyazı alt bölgede okunur; sahne nesneleri y=190–690 aralığında kalmalı. Girişte başlık geniş, kapanışta son soru yavaş ve belirgin.
- Bilimsel not: Ayrıştırıcı mantar ile mikorizal ilişki kuran mantar ayrı işlevlerdir. Kök emilimi toprağın çözeltisindeki bitki tarafından alınabilir mineral biçimler üzerinden anlatılır. Sarı/yeşil parçacıklar **eğitsel semboller**; fiziksel foton veya tek yönlü bir besin borusu değillerdir.

## Şut listesi (50 saniye, göreli ağırlık toplam 8)

| # | Yerel zaman | Plan / görsel hikâye | Hareket / ses | Kontrol |
|---|---|---|---|---|
| 1 | 00:00–00:07.50 | Kırmızı elma yeşil zemine iner, hafif seker, üstte başlık | Hızlı düşüş / kısa tok darbe | Elma ilk 2 saniyede anlaşılır |
| 2 | 00:07.50–00:14.38 | Aynı elmanın üstündeki lekeler belirir | Yakın kamera, matlaşma; hafif doku sesi | Elma hâlâ aynı nesne |
| 3 | 00:14.38–00:23.13 | Toprak katmanları ve ayrıştırıcı misel ağları | Kesit içinde hafif kayma, iplikler çoğalır | İplikler 'ışık taşıyan kablo' gibi sunulmaz |
| 4 | 00:23.13–00:31.25 | Pembe solucan kıvrılarak toprakta ilerler | Yandan takip; düşük frekanslı toprak sesi | Solucan, organik parçacıklarla aynı ölçekte |
| 5 | 00:31.25–00:40.00 | Kökler ve besin döngüsünü simgeleyen parçacıklar | Sağ kayma, çok hafif parıltı | Çözünmüş besin / kök emilimi mecaz olarak net |
| 6 | 00:40.00–00:50.00 | Genç filiz, sıcak sabah ışığı, son soru | Yavaş uzaklaşma, müzik azalır | Elma doğrudan ağaca dönüşmüş gibi görünmez |

## Uygulama / çalışma kontratı

1. **Opt-in**: `visual_preset='apple-soil-v1'` yalnız `backyard` sahnelerinde `appleSoil(ctx, scene, index, progress, time)` kullanır. Diğer bütün dört eski stil korunur. İçe aktarım bu alanı beyaz listeden geçirir.
2. **Deterministik**: `seek(t)` her kareyi yalnızca t + sahne verisinden üretir. `Math.random`, gerçek zamanlı bekleme, animasyon döngüsündeki state biriktirme yok.
3. **50 saniyelik kapsam**: Her aşama görsel olarak ayrı; aynı bahçe, elma, toprak katmanları ve ışık karakterini korur. Yeni varlıklar elle çizilmiş Canvas vektörleridir.
4. **Uyarılar**: Tam 3D kamera ve fizik, gerçek kırılma/yüzey simülasyonu, ileri seviye müzik ve özel efektler bu pilotta yok. `detail` açıklamaları doğrudan 3D nesneye çevrilmiyor; kodun desteklediği efektler kullanılıyor.
5. **Sistem entegrasyonu**: Mevcut v0.3 JSON içe aktarımı, storyboard onayı, timeline, MP4, contact sheet ve kalite raporu akışında değişiklik yok. Yeni profilde mevcut altyazı senkron yöntemi kullanılır: ElevenLabs gerçek zaman, diğerleri tahmin.

## Kabul testleri

- `npm run check` ve eski video stili testleri bozulmaz.
- JSON'la `makeStory` ve `cleanUpdate` üzerinden profil seçilebilir; `survival` + `apple-soil-v1` reddedilir.
- Altı farklı sahneden en az birer orijinal kare oluşturulur; kareler boş değildir.
- Aynı video ve aynı t için render iki kez aynıdır; iki farklı sahne kareleri içerik olarak ayrıdır.
- MP4 için 50 saniyelik gerçek üretim kullanılırken eSpeak anlatım süresi 50 saniyeyi aşarsa renderer süreyi uzatabilir. O yüzden anlatım süresini çıktıda denetleyin, 50 saniye olduğu varsayılmasın.
- Ses ve bilimsel açıklamaların insan tarafından dinlenip incelenmesi zorunludur. Teknik kalite raporu sanat yönetmeninin yerine geçmez.

## Sonraki yükseltmeler (uygulanmadı)

- Elmanın şekil değişimini fiziksel olarak daha iyi modellemek, kamera zoom/kaydırma geçişlerini her sahneye özgü yapmak.
- İsteğe bağlı Three.js 3D kesit profili, Blender ile ayrı GPU işçisi.
- Yerel veya API tabanlı görsel eleştirmen: contact sheet ve tam görüntü üzerine zaman damgalı hata geri bildirimi.
- TTS kelime zamanlamasının sahne ağırlığıyla çakıştığı yerlerde kullanıcıya uyarı ve otomatik uyumlama.
- Müziğin/efektlerin lisans kaydı, son kare döngü testi, sosyal platform API'leri (gerçek yayın hâlâ kapalı).

## Bilimsel referanslar

- USDA NRCS Soil Biology Primer: https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer
- USDA NRCS Soil Tech Note 11A: https://www.nrcs.usda.gov/state-offices/illinois/soil-tech-note-11a-biological-underground-community
- UMD Extension: https://extension.umd.edu/resource/soil-health-fs-2025-0754
