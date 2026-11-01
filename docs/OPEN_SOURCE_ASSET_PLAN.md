# Açık kaynak kütüphane ve varlık planı — 2026-11-01

Şimdiki oyun `src/logic.js` içinde özel WebGL1 motoruyla çiziliyor. Three.js eklemek otomatik olarak hazır animasyonlu oyuncu kazandırmaz; dosya formatı, yükleme ve animasyon sisteminin birlikte değişmesi gerekir.

## İncelenen adaylar

| Araç | Kaynak | Kullanım |
| --- | --- | --- |
| Three.js AnimationMixer | https://threejs.org/manual/pages/animation-system.html | Gerçek kemikli (rigged) animasyon klipleri ve geçişleri |
| Three.js GLTFLoader | https://threejs.org/docs/pages/GLTFLoader.html | glTF/GLB model yükleme |
| Three.js InstancedMesh | https://threejs.org/docs/pages/InstancedMesh.html | Çok sayıdaki aynı seyirci modelini az draw-call ile çizme |
| Kenney Animated Characters Protagonists | https://kenney.nl/assets/animated-characters-protagonists | CC0 rig'li insan modelleri (kaynak lisansı kontrol edilerek) |
| Kenney Animated Characters Retro | https://kenney.nl/assets/animated-characters-retro | CC0 animasyonlu insan modelleri (kaynak lisansı kontrol edilerek) |

Kenney paketleri FBX içerdiği için glTF dönüşümü veya FBX yükleyici gerekir; paketin gerçek dosyaları ve lisansı indirildikten sonra kontrol edilmeden oyun içine taşınmaz.

## Bu sürümün kararı

Yeni harici CDN bağımlılığı eklenmedi. v0.4'te **prosedürel** kol-bacak animasyonu ve **baked statik 4 geometri gruplu** tribün uygulanmıştır. Bunlara `skeletal animation` veya gerçek `InstancedMesh` denmemelidir.

Önce gerçek iPhone Safari GPU testi; sonra kontrollü Three.js ve CC0 glTF geçişi. Yeni görsel motor devreye alınmadan kariyer kaydı anahtarını değiştirme.

Neo Star Soccer'a ait kod, stadyum varlığı veya karakter modelleri alınmayacaktır. Yalnızca türün arayüz/oynanış yaklaşımı özgün tasarıma ilham verir.
