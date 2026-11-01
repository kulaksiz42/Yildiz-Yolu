# Yıldız Yolu — Futbol yapay zekâsı ve 3D model entegrasyon taslağı (v0.9 laboratuvar)

1 Kasım 2026

## Gelen teslimler
- `OKComputer_Yıldız_Yolu_—_Taktik_ve_Pres_Laboratuvarı.zip`
- `Yıldız-Yolu-Futbol-Yapay-Zekâsı.zip`
- `OKComputer_Kimi_Özellikleri.zip`

**Üç arşivin de çekirdek içerikleri SHA-256 ile karşılaştırıldı ve birbirinin aynısı çıktı**: `football-ai.js`, `demo.html`, `tests/football-ai.test.mjs`, `tests/performance.mjs` ve belgeler. Farklı yapay zekâ implementasyonları değiller.

## Doğrulama
- Orijinal `football-ai.js` motorunun 12/12 Node.js regresyon testi geçti.
- 20 saniyelik 11'e 11 işleme testi yerel Node.js v22'de yaklaşık 59 ms; bu sadece AI CPU testi, 3D GPU FPS ölçüsü değil.
- 120 Hz sabit zaman adımı, ofsayt çizgisi, pas/geri pas, pres/kademe, kontra ve taktik seçenekleri var.
- Bağımsız yeni 3D test projesinde Kimi 53 kemikli GLB ile Claude 22 kemikli GLB ve AI motoru tek Three.js r180 sahnesine bağlandı; GPU/safari sonuçları henüz onaylı değil.
- Bu oturumda Chromium yerel URL'leri `ERR_BLOCKED_BY_ADMINISTRATOR` ile reddetti. Birleşik 3D demo için tarayıcı görüntüsü/FPS kanıtı yok.

## Canlı kodu koruyarak geçiş
1. Ana repo hâlen **v0.8 beta**: `assets/rig/bridge.js` Claude futbolcu GLB'siyle isteğe bağlı 3D mod sağlıyor.
2. Yeni `football-ai.js` bağımsızdır; bir sonraki aşamada maçın yanına adaptör olarak konmalı; `match.player`, `match.team`, `match.defenders`, `match.carrier` nesnelerinden kalıcı kimlikli futbolcular oluşturulmalı.
3. İlk deneyde yalnızca topsuz koşu/pres hedefleri yeni AI'den alınmalı. `match.ball`, `advanceFlight` ve `finishFlight` eski sistemde kalmalı. **İki ayrı motor aynı topu hareket ettirmemeli.**
4. Kaleci ZIP'i geldiğinde el kemikleri / dünya koordinatları / şut fiziği ve dalış kliplerinin temas zamanlaması ayrı test edilmeli.
5. 30/60 FPS oyun tutarlılığı, mobil Safari WebGL ve kariyer kayıt geriye dönüklüğü doğrulanınca opt-in mod aktif edilebilir.
6. Nihai hedef: **tek WebGL sahnesi**, **tek top fiziği otoritesi**, **tek AI otoritesi**, model-animasyon-olay senkronizasyonu ve güvenli eski sürüme dönüş.

Not: Bağımsız laboratuvar ZIP'i bu sohbetin bir çıktısıdır; canlı `index.html` üzerine yazılmamıştır.
