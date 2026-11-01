# Yıldız Yolu — 3D Futbolcu Kariyeri

Mobil tarayıcı için özgün, sinematik futbolcu kariyeri oyunu.

## Proje durumu

## Oynanış v0.3

Joystick yönü, gerçek pas, dinamik savunmacılar, top kapma, kontra atak, frikik ve farklı şut sonuçları GitHub'daki canlı sürüme eklendi. Yerel Chromium 2D yedek kipinde 23/23 test geçti; **gerçek iPhone Safari/WebGL henüz test edilmedi.** Ayrıntılar: [Oynanış v0.3 raporu](docs/GAMEPLAY_V03.md).


**Mevcut sürüm: V2 GitHub Geliştirme 001.** Temel prototip üzerine kritik kontrol ve fizik düzeltmeleri uygulandı.

- Bu kaynaklar **Claude Checkpoint 001 (v0.2.1) değildir**. Checkpoint 001 ZIP'i henüz bu depoya aktarılmadı.
- Checkpoint 002 geliştirmeleri kaynak olarak teslim alınamadığı için bu depoda yok.
- V2, saf **WebGL1 + JavaScript** kullanır; Three.js veya harici CDN gerektirmez. WebGL kullanılamıyorsa 2D yedek görünüm vardır.
- Karakter oluşturma, sinematik görüşme, temel maç pozisyonları ve yerel kayıt prototip düzeyindedir.
- [Canlı oyunu aç](https://kulaksiz42.github.io/Yildiz-Yolu/). GitHub Pages dağıtımı yapılandırılmıştır; canlıda hangi commit'in göründüğü bu araç ortamından doğrulanamadı.\n- Gerçek iPhone Safari ve WebGL görsel performansı **doğrulanmadı**; bu depo üretim sürümü değildir.\n- Değişiklikler ve test sınırları için `docs/CHANGELOG.md` dosyasına bak.

## Dosyalar

| Yol | Amaç |
| --- | --- |
| `index.html` | Oynanabilir tek dosya, oluşturulan çıktı |
| `src/logic.js` | Düzenlenebilir oyun mantığı ve WebGL |
| `src/template.html` | HTML/CSS ve arayüz şablonu |
| `build.py` | Kaynaklardan `index.html` dosyasını yeniden üretir |
| `docs/ROADMAP.md` | Aşamalı geliştirme planı |
| `docs/CHECKPOINT_001_NOTES.md` | Kodu henüz aktarılmamış Claude düzeltmelerinin notları |

## Geliştirme

Python 3 ile proje klasöründe:

```bash
python3 build.py
python3 -m http.server 8000
```

Ardından bilgisayarda `http://localhost:8000` adresini aç. `index.html` tek dosyadır ve internete yayımlandığında statik HTTPS altında çalışabilir. WebGL için gerçek tarayıcı testi gerekir.

## Çalışma disiplini

1. Önce mevcut kodu ve kayıt anahtarını incele.
2. Tek bir hata/özellik üzerinde çalış.
3. `src/` kodlarını güncelle, `python3 build.py` ile `index.html` üret.
4. Test et; Safari testi yapılmadıysa yapıldı deme.
5. Her tamamlanan aşamayı ayrı GitHub commit'i olarak kaydet.
6. Checkpoint 001 kaynakları gelirse önce fark analizi yap; mevcut dosyaları körlemesine üzerine yazma.

## Haklar

Bu özgün bir prototiptir. FIFA ve Neo Star Soccer ile ilişkisi yoktur. Gerçek kulüp adları, oyuncu isimleri, logolar, formalar ve portrelerin ticari kullanım hakları ayrıca değerlendirilmelidir.
