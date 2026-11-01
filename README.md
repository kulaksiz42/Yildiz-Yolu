# Yıldız Yolu — 3D Futbolcu Kariyeri

Mobil tarayıcıda oynanabilen, özgün bir sinematik futbolcu kariyeri prototipi.

**[Canlı oyunu aç](https://kulaksiz42.github.io/Yildiz-Yolu/)** · **Güncel oyun sürümü: v0.7** · [Kariyer hikâyesi entegrasyonu](docs/CAREER_V07.md)

## Oynanış v0.7

- Altı aşamalı oyuncu oluşturma: ad/lakap, ülke, mevki, görünüm/güçlü ayak, karakter ve kulüp
- Üç bağımsız kariyer kayıt yuvası ve eski yerel kaydı koruyarak içeri aktarma
- Kesintisiz pas ve geri pas, seçilebilir pas hedefi, takım arkadaşları ve hareketli savunmacılar
- Şut çeşitleri: sert, plase, aşırtma; serbest vuruş, top kapma, kontra atak
- Dinamik saha radarı, anatomik şekilli 3D futbolcular, eklem tabanlı koşu/şut/kaleci pozları ve daha yakın kamera; WebGL yoksa 2D yedek görünüm
- Ülkeye göre başlangıç hikâyesi, hoca konuşmaları ve **16 isteğe bağlı, kayıtlı sonuçları olan kariyer olayı**

**Sınır:** Bu hâlâ prototiptir. Yüksek kaliteli GLB rig'li futbolcu animasyonları, gelişmiş top fiziği, uzun maç/kariyer sistemleri ve gerçek Safari performans testleri henüz tamamlanmadı. Ülke/lig adlarının bir kısmı kurgusaldır. Neo Star Soccer veya FIFA'nın kodu, görsel varlığı ya da marka materyalleri oyuna dahil edilmedi.

## Proje dosyaları

| Yol | Görev |
| --- | --- |
| `index.html` | GitHub Pages'te oynanan tek dosya |
| `src/logic.js` | Özgün WebGL1 motoru, fizik, kariyer ve kontroller |
| `src/template.html` | HTML ve CSS şablonu |
| `build.py` | Tek dosyayı yeniden üretir |
| `tests/smoke.py` | GitHub Actions Chromium mobil smoke testi |
| `.github/workflows/check.yml` | Sözdizimi ve build tutarlılığı |
| `.github/workflows/mobile-smoke.yml` | Otomatik tarayıcı testi |
| `docs/GAMEPLAY_V06.md` | v0.6 anatomik 3D modeller ve sınırlar |
| `docs/CAREER_V07.md` | v0.7 ülke/mevki hikâyeleri, veri kaynağı ve testler |
| `docs/THIRD_PARTY_SOURCE_REVIEW.md` | Neo Star Soccer yayın paketi ve lisans incelemesi |

## Geliştirme

```bash
python3 build.py
python3 -m http.server 8000
```

Tarayıcıdan `http://localhost:8000` aç. Güncelleme için `src/` dosyalarını düzenle, `build.py` çalıştır, kontrolleri doğrula ve ardından `index.html` dosyasını aynı commit'te güncelle.

## Kayıt veri güvenliği

Yeni kariyerler `yildizyolu_slots_v1` anahtarında üç bağımsız yuva tutar. Eski `yildizyolu_cinematic_v2` kaydı **silinmez veya yeni kayıt tarafından yazılmaz**. Aynı yuvaya yeni kariyer başlatmak onay gerektirir ve önce ek yedek oluşturulur. Kayıtlar cihazdaki tarayıcı depolamasındadır; tarayıcı verilerini silmek kayıtları kaybettirebilir. Bulut senkronizasyonu yoktur.

## Üçüncü taraf kodlar

Neo Star Soccer GitHub deposu derlenmiş yayın dosyalarını barındırır. Açık lisans sunulmadığından oradaki JS/CSS paketleri veya oyun varlıkları kullanılmadı. Üçüncü taraf `neostarsoccer-site-main.zip` güncel dal üzerinden kaldırılmıştır. Eski Git commit geçmişinden temizleme ayrıca yapılmalıdır.

Bu proje FIFA ve Neo Star Soccer ile bağlantılı değildir.
