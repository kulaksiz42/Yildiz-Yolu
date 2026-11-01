# Video Studio v0.3 – Değişiklik ve sınır notları

- **Storyboard:** 2–12 sahne, reorder, ekrandaki başlık, seslendirme, görsel not, beş kamera planı, ağırlıklı süre.
- **Onay kapısı:** Yeni video onaylanmadan render API'si 409. v0.2 eski kayıtlar uyumlu.
- **Çıktı:** FPS 12/24/30; 540×960 Canvas veya 1080×1920 yükseltilmiş MP4.
- **QA:** ffprobe, boş kare, kare tekrarlanabilirlik, contact sheet + sahne bazında **kurallı** editör önerileri. AI görsel karar vericisi yoktur.
- **Claude Free:** Kod deposu erişimi gerektirmeyen JSON hikâye üretim promptu; kullanıcı onayı ve elle aktarma.
- **Güvenlik:** Sosyal medya hesabına otomatik paylaşım yok. Kullanıcı izinleri ve anahtarları Git'e kaydedilmez. `data`/`output` Git dışında.
- **Test:** node:test, Python API/render smoke, offline Playwright gerçek frontend mock API. Sonuçlar sadece koşturulmuş testler için raporlanır.
- **Sınırlamalar:** Native Full HD değil; render altlığı 540×960. Ses için espeak veya ElevenLabs. Claude Free entegrasyonu doğrudan ağ API bağlantısı değil; metin aktarımı.
