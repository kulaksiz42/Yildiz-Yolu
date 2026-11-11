# TikTok LIVE Oyun Konsepti — Türkiye Kitlesi Odaklı Araştırma ve Tasarım

> Durum: **Tasarım belgesi. Kod yok.** Bu belge ilk aşama araştırma, 15 fikir, puanlama ve seçilen konseptin ayrıntılı tasarımını içerir.
> Tarih: Kasım 2026.

---

## 0. Önce dürüst notlar (neyi bildiğimiz, neyi tahmin ettiğimiz)

| Konu | Durum |
| --- | --- |
| `furkancavlak/tiktok-oyun-fabrikasi` deposu | **Okundu (README + package.json).** MIT lisanslı. Node.js + resmî olmayan `tiktok-live-connector` kütüphanesiyle canlı yayın olaylarını okuyan bir köprü (`kopru.js`), ortak çekirdek (`cekirdek/`), şablon ve tek örnek oyun ("Mendil Kimde?" halay oyunu) içeriyor. Yorum = katılım, beğeni = ortak coşku göstergesi, hediye = jeton değerine göre kademeli efekt, en çok hediye atan = özel rol (halay başı). Deneme modunda sahte izleyicilerle TikTok'a bağlanmadan çalışıyor. 720×1280 dikey sahne. Şehir/takım sistemi **yok**. |
| Bağlantı riski | README'nin kendisi de belirtiyor: TikTok'un yorum/hediye için **resmî açık API'si yok**; kütüphane üçüncü taraf bir imza servisine (Euler Stream) bağlı ve ücretsiz kullanım sınırlanabilir. |
| Piyasa verisi | Bu çalışmada güncel TikTok LIVE izlenme istatistiklerine erişmedim. Aşağıdaki piyasa analizi **gözleme ve genel bilgiye dayalı varsayımdır**; sayı olarak sunulan hiçbir şey doğrulanmış veri değildir. |
| İzleyici şehri ve yaşı | TikTok canlı yayın olaylarında izleyicinin **şehri ve yaşı gelmez.** Şehir ancak izleyicinin **kendi yazmasıyla** (ör. plaka kodu) alınabilir. Yaşa göre hedefleme teknik olarak mümkün değildir; yalnızca içerik tonunu farklı yaş gruplarına hitap edecek şekilde tasarlayabiliriz. |
| Kurallar | TikTok'ta hediye gönderme 18 yaş ve üzeriyle sınırlıdır (bölgeye göre değişebilir). TikTok LIVE kuralları kumar, yanıltıcı ödül vaadi ve hediye karşılığı gerçek dünya ödülü gibi şeyleri yasaklar. **Yayından önce güncel TikTok LIVE Topluluk Kuralları ve Hediye Politikası tekrar okunmalı**; bu belge hukuki doğrulama değildir. |

**Sorunuzun kısa cevabı:** Evet, mümkün. Türkiye'deki şehirleri oyunun *takımları* yapmak, Türk kitlesi için bulabileceğimiz en güçlü katılım kancalarından biri. Ama şehir bilgisi otomatik gelmez; izleyiciye **"Plakanı yaz!"** dedirtmek gerekir. Yaş grubu ise hedeflenemez, yalnızca müzik ve görsel dil ile her yaşa hitap edilebilir.

---

## 1. AŞAMA 1 — Piyasa Analizi (gözleme dayalı)

### 1.1 Türk TikTok LIVE'da ilgi gören formatlar ve neden çalıştıkları

| Format | Neden ilgi çekiyor (psikoloji) | Zayıf yanı |
| --- | --- | --- |
| **Halay / oyun havası** | Kolektif ritüel; "ben de halkadayım" hissi. Davul-zurna yaşlıya da gence de tanıdık. | Kısa sürede tekdüzeleşir; görsel değişim az. |
| **Araba / at yarışı** | Anında anlaşılır: önde olan kazanıyor. Yakın yarış = gerilim. | Hediye atan 2 kişinin savaşına dönüşür; izleyen pasif kalır. |
| **Kale / bayrak savaşı** | Takım aidiyeti, toprak kazanma. | Ülke/bayrak temalı olanlar milliyetçi gerilim üretebilir. |
| **Karakter savaşı / PK** | Kişisel ego, isim görünürlüğü. | Bilgi gerektirebilir; sıkıcı skor güncellemesi. |
| **Dans / müzik** | Ritim beyni yakalar, ses kapalı olsa bile hareket görülür. | Telif riski yüksek; çoğu yayın hazır şarkı kullanıyor. |

### 1.2 Türk izleyiciye özel kancalar
1. **Memleket aidiyeti:** "Nerelisin?" Türkiye'de sohbetin ilk sorusu. Plaka kodları (34, 06, 35, 61, 21...) herkesin bildiği, yazması iki saniye süren bir kimlik.
2. **Gurbet duygusu:** Yurt dışındaki Türkler için memleketini ekranda görmek güçlü bir duygusal tetik.
3. **Yöresel müzik çeşitliliği:** Horon, zeybek, halay, bar, teke, roman havası — her biri farklı tempo ve karakter. Bu, müziği *oyun motoru* yapmak için hazır bir zenginlik.
4. **Mizah dili:** Pazar esnafı, dayı, teyze, düğün, çay — tanıdık, kimseyi aşağılamayan mizah.

### 1.3 Yaş gruplarına göre beklenti (varsayım)

| Grup | Ne ister | Tasarıma yansıması |
| --- | --- | --- |
| 13–17 (izleyici; hediye gönderemez) | Hız, meme, remix, kendi adını görmek | Yorum ve beğeniyle **tam katılım**. Hediye baskısı yok. |
| 18–24 | Rekabet, drop'lu elektronik müzik, paylaşılabilir an | EDM + darbuka "drop"lar, klip üretimi |
| 25–44 | Memleket rekabeti, nostalji, takım ruhu | Şehir takımları, liderlik olayları |
| 45+ | Türkü, oyun havası, büyük okunaklı yazı, tanıdık yerler | Büyük yazı, yerel simgeler (Saat Kulesi, Galata, Uzungöl), sade arayüz |
| Gurbetçiler | Memlekete bağ | "Gurbet" özel takımı (plaka yerine `99` veya ülke yazımı) |

---

## 2. AŞAMA 2 — 15 Farklı Konsept

Her konsept için: **Hikâye · Ekran · Müzik · Katılım · Hediye · PK/Liderlik · Sürpriz · Viral an · Teknik zorluk · Dezavantaj**

### 1) MEMLEKET RİTMİ — "Plakanı yaz, şehrin çalsın!"
- **Hikâye:** Dikey ekranda dev, ışıklı bir Türkiye haritası bir konser sahnesine dönüşmüş. Her bölgenin bir enstrümanı var; şehirler canlandıkça orkestra büyüyor.
- **Ekran:** Üstte harita-sahne, ortada o anki "sahnedeki şehir" ve kalabalığı, altta ilk 5 şehir tablosu.
- **Müzik:** Katmanlı (stem) özgün beste. Karadeniz kemençe, Ege bağlama/zeybek davulu, Doğu davul-zurna, Akdeniz klarnet, Marmara elektronik bas... Hangi bölge aktifse onun katmanı girer.
- **Katılım:** Yorumda plaka/şehir adı → kalabalığa minik karakter olarak katılır.
- **Hediye:** Şehrin simge yapısı kat kat inşa edilir, şehre ait kısa melodi çalar.
- **PK:** İlk iki şehir 60 sn'lik "Yöre Düellosu"na girer (horon vs zeybek).
- **Sürpriz:** Rastgele "Düğün Baskını", "Elektrik Kesildi — davul akustik devam".
- **Viral an:** Lider değişirken müziğin bir anda başka yöreye geçmesi.
- **Teknik:** Orta-yüksek (katmanlı müzik + şehir eşleme).
- **Dezavantaj:** Şehir rekabeti toksikleşebilir → moderasyon ve olumlu çerçeve şart.

### 2) HALAY ZİNCİRİ
- **Hikâye:** Sonsuz bir halay halkası; her yorumcu zincire girer, en uzun zincir rekor.
- **Ekran:** Spiral halay halkası, ortada davulcu.
- **Müzik:** Davul-zurna; zincir uzadıkça tempo artar.
- **Katılım/Hediye:** Yorum = katıl, hediye = mendil sallama, halay başına geçme.
- **PK:** Halay başı koltuğu.
- **Sürpriz:** Zincir kopar, herkes yere düşer (komik fizik).
- **Viral an:** 500 kişilik halayın tek ekranda dönmesi.
- **Teknik:** Düşük.
- **Dezavantaj:** Referans depodaki örnek oyuna çok yakın; özgünlüğü düşük.

### 3) DÜĞÜN KONVOYU
- **Hikâye:** Gelin arabası konvoyu şehirden şehre ilerliyor; her izleyici bir araba.
- **Ekran:** Yukarıdan bakışlı otoyol, süslü arabalar.
- **Müzik:** Darbuka + klarnet; korna sesleri ritme oturtulmuş.
- **Katılım/Hediye:** Yorum = araba; hediye = arabayı süsle, limuzine dönüştür, havai fişek.
- **PK:** Gelin arabasının arkasındaki ilk sıra.
- **Sürpriz:** Yol kesen köy çocukları "bahşiş" ister (komik).
- **Viral an:** 50 araba aynı anda kornayla ritim çalar.
- **Teknik:** Orta.
- **Dezavantaj:** Yarış hissi yine az kişinin savaşına kayabilir.

### 4) RİTİM KULESİ
- **Hikâye:** Takımlar müziğin her vuruşunda bir kat çıkan kule inşa eder.
- **Ekran:** Yan yana iki kule, bulutların üstüne uzanır.
- **Müzik:** Elektronik + darbuka; her vuruş = kat.
- **Katılım/Hediye:** Beğeni = tuğla, hediye = özel kat (cam, altın, roket).
- **PK:** Kule yüksekliği.
- **Sürpriz:** Rüzgâr kuleyi sallar, kat düşer.
- **Viral an:** Kulenin yıkılması.
- **Teknik:** Orta (fizik).
- **Dezavantaj:** Görsel olarak sıradan; kule oyunları yaygın.

### 5) ÇAY OCAĞI
- **Hikâye:** Çaycı tepsiye ince belli bardak dizer; takımlar en yüksek çay kulesini yapar.
- **Müzik:** Kaşık-bardak şıngırtısından yapılmış ritim.
- **Katılım/Hediye:** Yorum = bardak; hediye = simit, büyük semaver.
- **PK:** Tepsiyi taşıyan çaycı rolü.
- **Sürpriz:** Kedi tepsiye atlar.
- **Viral an:** 200 bardaklık kulenin devrilmesi.
- **Teknik:** Orta.
- **Dezavantaj:** Kültüre çok bağlı; müzik potansiyeli sınırlı.

### 6) VAPUR VE MARTI
- **Hikâye:** Boğaz'da vapurlar yarışır, martılar simit çalar.
- **Müzik:** Lo-fi + vapur düdüğü ritmi.
- **Katılım/Hediye:** Yorum = martı; hediye = vapur hızlanır, dev martı.
- **PK:** Önde giden vapurun kaptanı.
- **Sürpriz:** Yunus sürüsü.
- **Viral an:** Martının liderin simidini kapması.
- **Teknik:** Orta.
- **Dezavantaj:** İstanbul merkezli; Anadolu'yu dışlayabilir.

### 7) MAHALLE ORKESTRASI (dev ritim makinesi)
- **Hikâye:** Ekran 8×16'lık dev bir ritim ızgarası; izleyiciler yorumla nota yerleştirerek ortak beste yapar.
- **Müzik:** Müziği izleyiciler üretiyor (sıralayıcı/sequencer).
- **Katılım/Hediye:** Yorum = nota; hediye = yeni enstrüman açma, solo.
- **PK:** "Bestenin sahibi" rozeti.
- **Sürpriz:** Rastgele "remix" düğmesi.
- **Viral an:** İzleyicilerin yaptığı şarkının gerçekten güzel çıkması.
- **Teknik:** Orta.
- **Dezavantaj:** Ritim makinesini yaşlı izleyici hızla anlamaz; kaos sesi çıkabilir.

### 8) PAZAR YERİ BAĞIRMA YARIŞI
- **Hikâye:** Pazarcı tezgâhları; yapay zekâ ses, izleyici yorumlarını pazarcı bağırışına dönüştürür.
- **Müzik:** Bağırışların ritme oturtulduğu remix.
- **Katılım/Hediye:** Yorum = ürün/çığırtka; hediye = tezgâh büyür, dev karpuz.
- **PK:** Pazarın en çok müşteri çeken tezgâhı.
- **Sürpriz:** Zabıta geliyor!
- **Viral an:** "Domatesler bal gibiiii" remixi.
- **Teknik:** Yüksek (TTS + filtre).
- **Dezavantaj:** Kullanıcı metnini seslendirmek moderasyon riski çok yüksek.

### 9) KAPADOKYA BALON YARIŞI
- **Hikâye:** Gün doğumunda sıcak hava balonları yükselir.
- **Ekran:** Peri bacaları, renkli balonlar — ilk 3 saniyede çok etkileyici.
- **Müzik:** Sinematik + bağlama.
- **Katılım/Hediye:** Yorum = balon; beğeni = ateş; hediye = dev balon, havai fişek.
- **PK:** En yükseğe çıkan balon.
- **Sürpriz:** Kuş sürüsü balonları iter.
- **Viral an:** Gökyüzünün 300 balonla dolması.
- **Teknik:** Orta.
- **Dezavantaj:** Rekabet ve komedi zayıf, "güzel ekran koruyucu" olma riski.

### 10) HORON FIRTINASI
- **Hikâye:** Karadeniz horonu sürekli hızlanır; ritmi tutamayan düşer, en son ayakta kalan kazanır.
- **Müzik:** Kemençe + elektronik; BPM 120'den 200'e.
- **Katılım/Hediye:** Yorum = katıl; hediye = "dayanıklılık" (çay, hamsi).
- **PK:** Son ayakta kalan.
- **Sürpriz:** Yağmur, kaygan zemin.
- **Viral an:** Hızlanan horonda topluca düşüş.
- **Teknik:** Düşük-orta.
- **Dezavantaj:** Tek yöre; tüm Türkiye'yi kapsamaz.

### 11) BOĞAZ KÖPRÜSÜ DÜELLOSU
- **Hikâye:** İki takım karşı kıyılardan köprü kurar; önce ortada buluşan kazanır.
- **Müzik:** Gerilim davulları.
- **Katılım/Hediye:** Beğeni = vida, hediye = vinç, halat.
- **PK:** Köprünün ortası.
- **Viral an:** Köprünün son parçasının yerine oturması.
- **Teknik:** Orta.
- **Dezavantaj:** Bir tur bitince sıfırlanır; uzun süreli bağ az.

### 12) KINA GECESİ KOSTÜM ŞOVU
- **Hikâye:** İzleyiciler podyuma çıkan karakterlere dönüşür; hediyeyle kostüm değişir.
- **Müzik:** Roman havası, darbuka.
- **PK:** "Gecenin yıldızı".
- **Sürpriz:** Karakter yanlışlıkla dev bir patlıcan kostümüne dönüşür.
- **Viral an:** Komik dönüşümler.
- **Teknik:** Yüksek (çok sayıda kostüm varlığı).
- **Dezavantaj:** Varlık maliyeti yüksek.

### 13) BULUT ÇOBANLARI
- **Hikâye:** Takımlar bulutları kendi şehirlerinin üstüne güder; yağmur yağan şehir yeşerir.
- **Müzik:** Yağmur ritmi + bağlama.
- **PK:** En yeşil şehir.
- **Viral an:** Kurak haritanın aniden yeşermesi.
- **Teknik:** Orta.
- **Dezavantaj:** Soyut; ilk 3 saniyede anlaşılması zor.

### 14) SES DALGASI SÖRFÜ
- **Hikâye:** Müziğin dalga formu bir okyanus; karakterler dalgaların üstünde sörf yapar.
- **Müzik:** EDM; drop = dev dalga.
- **PK:** Dalganın tepesindeki sörfçü.
- **Viral an:** Drop anında herkesin havaya uçması.
- **Teknik:** Orta.
- **Dezavantaj:** Türk kültürüne bağı zayıf (ama uluslararası açıdan güçlü).

### 15) KARAGÖZ GÖLGE DÜELLOSU
- **Hikâye:** Perde arkasında gölge oyunu karakterleri; izleyicilerin yorumları komik replik olur.
- **Müzik:** Geleneksel nefes + modern beat.
- **PK:** Perdenin ortasındaki karakter.
- **Viral an:** Gölgelerin dans etmesi.
- **Teknik:** Orta-yüksek (diyalog ve moderasyon).
- **Dezavantaj:** Genç kitle için eski bulunabilir; yorumların ekrana replik olması riskli.

---

## 3. AŞAMA 3 — Puanlama (100 üzerinden, tahmindir)

Kriterler: Dikkat (15) · Yaş kapsayıcılığı (15) · Eğlence/Müzik (15) · Rekabet/Gönüllü hediye (15) · Tutma (15) · Viral (15) · Teknik uygulanabilirlik (10)

| # | Konsept | Dikkat | Yaş | Müzik | Rekabet | Tutma | Viral | Teknik | **Toplam** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Memleket Ritmi** | 13 | 15 | 15 | 14 | 14 | 13 | 6 | **90** |
| 10 | **Horon Fırtınası** | 12 | 12 | 14 | 12 | 12 | 13 | 8 | **83** |
| 9 | **Kapadokya Balon Yarışı** | 15 | 14 | 11 | 11 | 11 | 13 | 7 | **82** |
| 3 | Düğün Konvoyu | 12 | 14 | 13 | 11 | 11 | 12 | 7 | 80 |
| 2 | Halay Zinciri | 11 | 15 | 13 | 10 | 10 | 11 | 9 | 79 |
| 14 | Ses Dalgası Sörfü | 13 | 11 | 14 | 10 | 11 | 12 | 7 | 78 |
| 7 | Mahalle Orkestrası | 11 | 9 | 15 | 9 | 12 | 13 | 7 | 76 |
| 6 | Vapur ve Martı | 12 | 12 | 10 | 11 | 10 | 12 | 7 | 74 |
| 12 | Kına Gecesi Kostüm | 12 | 11 | 12 | 11 | 10 | 12 | 4 | 72 |
| 5 | Çay Ocağı | 11 | 13 | 8 | 10 | 10 | 13 | 7 | 72 |
| 4 | Ritim Kulesi | 10 | 11 | 11 | 12 | 10 | 11 | 7 | 72 |
| 11 | Boğaz Köprüsü | 10 | 12 | 9 | 12 | 9 | 11 | 7 | 70 |
| 8 | Pazar Yeri | 11 | 12 | 11 | 9 | 10 | 14 | 3 | 70 |
| 15 | Karagöz | 10 | 10 | 10 | 9 | 10 | 11 | 5 | 65 |
| 13 | Bulut Çobanları | 8 | 10 | 9 | 10 | 9 | 9 | 7 | 62 |

**Gerekçeler (finalistler):**
- **Memleket Ritmi (90):** Plaka kodu = 2 saniyelik, herkesin bildiği katılım. Takım = şehir olduğu için **hediye atmayan da takımına puan taşır**; yayın "iki zenginin savaşı" olmaz. Müzik gerçekten oyun motoru. Eksi: teknik olarak en zahmetlisi ve şehir rekabetinin moderasyonu gerekiyor.
- **Horon Fırtınası (83):** Çok basit ve müzik odaklı, "hızlanıp düşme" komedisi güçlü. Eksi: tek yöre, sınırlı çeşitlilik.
- **Kapadokya Balon (82):** İlk 3 saniyenin şampiyonu. Eksi: rekabet ve mizah zayıf.

**Acımasız eleştiri:** Horon Fırtınası ve Kapadokya Balon kendi başlarına zayıf ama **Memleket Ritmi'nin içinde "olay" olarak yaşayabilir** (Karadeniz lider olunca horon hızlanması; gün batımı geçişinde balon yağmuru). Bu yüzden finalistler birleştirildi.

---

## 4. AŞAMA 4 — Seçilen Konsept: **MEMLEKET RİTMİ**

### 4.1 Ad ve marka
- **Ad:** MEMLEKET RİTMİ
- **Slogan:** *"Plakanı yaz, şehrin çalsın!"*
- **Logo fikri:** Plaka şeridi (mavi TR bandı esintili ama bayrak/resmî simge kullanmadan) üzerinde ses dalgası.
- **Karakter dili:** Sıcak, şakacı, kimseyi küçümsemeyen. "Şehir düşmanlığı" değil, "memleket şenliği".

### 4.2 9:16 ekran yerleşimi (1080×1920)
```
┌───────────────────────────┐
│ ① ÜST ŞERİT (0–160px)     │  "SAHNEDE: 61 TRABZON 🎻"  + tur sayacı (sakin, baskısız)
├───────────────────────────┤
│ ② HARİTA-SAHNE (160–900)  │  Neon Türkiye haritası; aktif şehirler nabız gibi atar,
│                           │  ışık hüzmeleri şehirden sahneye akar
├───────────────────────────┤
│ ③ ANA SAHNE (900–1450)    │  Sahnedeki şehrin simgesi + o şehrin dans eden kalabalığı
│                           │  (her izleyici minik karakter, adının baş harfleri üstünde)
├───────────────────────────┤
│ ④ İLK 5 ŞEHİR (1450–1700) │  Büyük, okunaklı: 34 İSTANBUL ▮▮▮▮▮ 1.240
├───────────────────────────┤
│ ⑤ ALT BÖLGE (1700–1920)   │  TikTok yorum alanıyla çakışmasın diye BOŞ/sade bırakılır;
│                           │  yalnız "Plakanı yaz! 34 / 06 / 35 ..." ipucu
└───────────────────────────┘
```
Kural: Aynı anda **en fazla 3 hareketli odak** (harita nabzı, sahne, olay). Geri kalan sakin.

### 4.3 İlk 3 saniye
Kaydıran kişi şunu görür: **Kararmış Türkiye haritasında şehirler tek tek havai fişek gibi yanıyor, her yanan şehirle müziğe yeni bir enstrüman giriyor** ve büyük yazı: **"ŞU AN 47 ŞEHİR ÇALIYOR — SENİNKİ NEREDE?"** Kendi şehrini aramak doğal bir merak — insanlar haritada kendi memleketini ararken durur.

### 4.4 Oyun mekaniği
1. **Katılım:** Yorumda plaka (`34`) veya şehir adı (`izmir`, `diyarbakır`, `ist`, `antep`) yazılır → takma ad eşleme tablosuyla şehre atanır. Yurt dışı: `gurbet` veya `99`.
   - Kişi sonradan şehir değiştiremez (o tur için) — sadakat hissi.
2. **Tur yapısı (6–8 dk):** Isınma (2 dk) → Yöre Düellosu (3 dk) → Final Kreşendo (1 dk) → Kutlama (30 sn) → kısa mola/özet.
3. **Şehir Enerjisi puanı** (hepsinin katkısı var):
   - Yeni katılan kişi: +büyük puan (kalabalık önemli)
   - Yorum (spam engelli, kişi başı dakikada sınırlı): +küçük
   - Beğeni: "coşku" → şehrin ritim hızı
   - Paylaşım/takip: +orta (bağış değil, büyüme katkısı)
   - Hediye: +puan, ama **azalan getiriyle** (ör. kişi başına karekök ölçekli). Böylece tek kişinin büyük hediyesi, 200 kişilik kalabalığı tek başına ezmez.
4. **Her izleyicinin kişisel izi:** Kalabalıkta kendi karakteri, adının baş harfleri; katkı arttıkça karakter "çırak → usta → üstat → Memleket Yıldızı" kademelerinden geçer (kozmetik).

### 4.5 Müzik ve ritim sistemi (oyunun motoru)
- **Sabit tempo ızgarası:** Tüm müzik tek bir saat (ör. 120–128 BPM, 4/4; halay bölümlerinde 2/4 ve 9/8 renkleri) üzerinde döner.
- **Katmanlar (stem):** Taban ritim (davul+bas) her zaman çalar. Her bölge bir katman ekler:
  | Bölge | Katman | Duygu |
  |---|---|---|
  | Karadeniz | Kemençe motifleri, hızlı horon figürü | Enerji |
  | Ege | Zeybek davulu, bağlama | Ağırbaşlı güç |
  | Akdeniz | Klarnet, darbuka | Sıcaklık |
  | İç Anadolu | Bağlama, uzun hava esintisi | Nostalji |
  | Doğu / Güneydoğu | Davul-zurna halay | Coşku |
  | Marmara | Elektronik bas, synth | Şehir hızı |
  | Gurbet | Akordeon/elektronik karışım | Hasret |
- **Olaylar vuruşa oturur (kuantizasyon):** Bir hediye geldiğinde efekt hemen değil, **bir sonraki ölçünün ilk vuruşunda** patlar. Bu, her olayı "koreografi" gibi hissettirir — sistemin en önemli "kaliteli his" sırrı.
- **Liderlik değişimi = modülasyon:** 2 ölçülük davul geçişi → müzik yarım ton yükselir → yeni liderin yöre katmanı ana melodiye geçer.
- **Final kreşendo:** Son 60 saniyede tempo kademeli artar (ör. 128 → 140); "drop" anında kazanan şehrin enstrümanı solo çalar.
- **Telif:** Tüm melodiler **özgün beste**. Anonim halk ezgileri kamu malı olabilir, ama belirli kayıtlar ve düzenlemeler değildir → hazır kayıt kullanılmaz. Yapay zekâ müzik üretici kullanılırsa ticari/yayın lisansı yazılı kontrol edilmeli. Ritim döngüleri ücretsiz-ticari lisanslı (CC0) örneklerle veya kendi kaydımızla hazırlanır.

### 4.6 Hediyelerin görsel ve işitsel etkisi (dünyada bir şey değişir)
Hediye adları TikTok'ta değişebildiği için tasarım **jeton değeri kademelerine** göre yapılır:

| Kademe | Görsel | Ses | Oyun etkisi |
|---|---|---|---|
| Küçük | Gönderenin karakteri zıplar, şehrinden haritaya ışık hüzmesi | Tek darbuka "tek" | Küçük puan |
| Orta | Şehrin **simgesine bir kat** eklenir (Saat Kulesi'ne saat, Galata'ya külah, Uzungöl'e sis) | Yöre motifi 1 ölçü öne çıkar | Puan + şehir kalabalığı dans figürü değiştirir |
| Büyük | "**Memleket Girişi**": gönderenin adıyla şehrinin kısa sinematik girişi (kamera haritada o şehre dalar) | Yöre melodisi 4 ölçü solo | Şehir 15 sn "ritim liderliği" kazanır: müzik o yöreye döner |
| Çok büyük | "**Şehir Uyanıyor**": simge yapı tamamlanır, harita gün batımı → gece; balon/havai fişek gösterisi | Tam orkestra tutti | Herkes için ortak bir an; **hediye atmayan izleyicilerin de karakterleri bu kutlamada dans eder** |

İlke: Hediye gönderen **kendi şehrine bir anı hediye ediyor** — kendine değil. Bu, sosyal olarak takdir edilen ve harcama baskısı içermeyen bir motivasyon.

### 4.7 Liderlik ve PK sistemi
- **Sahnedeki Şehir:** Enerjisi en yüksek şehir sahneyi alır; müzik onun yöresine yaslanır.
- **Yöre Düellosu (PK):** Turun ortasında ilk iki şehir karşılaşır. Ekran ikiye bölünür: solda zeybek, sağda horon. Kazanan iki ölçülük danstan anlaşılır — **sadece skor değil, hangi dansın ekranı kapladığı** görülür (kazanan tarafın dansçıları sınır çizgisini iter).
- **Geri gelme mekaniği:** Gerideki şehirde yeni katılım olunca "**Memleket Çağrısı**" — o şehir için haritada çağrı ışığı yanar, yeni katılımcı puanı geçici olarak artar. Bu, hediye değil **paylaşım/arkadaş çağırma** teşvik eder.
- **Ligler:** Günün Şehri, Haftanın Şehri (kalıcı tablo, ertesi gün yayın başında gösterilir) → tekrar gelme sebebi.
- **Kişisel unvan:** Her şehrin en çok katkı yapanı "**Şehir Elçisi**" (hediye+yorum+katılım birleşik puanı; sadece hediye değil).

### 4.8 İzleyicilerin katılımı (hediyesiz rol listesi)
| Eylem | Etki |
|---|---|
| Plaka yazmak | Kalabalığa katılım (en büyük tekil puan) |
| Beğeni | Şehrin coşku göstergesi; dolunca kalabalık özel figür yapar |
| Yorumla `hey!` / `hop!` | Nakarat anlarında kalabalığın bağırışına katılır (ekranda dalga) |
| Paylaşım | Şehre "Memleket Çağrısı" ışığı |
| Takip | Karaktere küçük kalıcı rozet |
| Oylama (`1`/`2`) | Sıradaki sürpriz olayını seçer |

Not: Yayın gecikmesi birkaç saniye olduğu için **vuruşa denk yorum yazma** gibi zamanlama oyunları yapılmaz; katılım her zaman zamanlamadan bağımsızdır.

### 4.9 Tekrar izlenme sebepleri
1. Dünkü "Haftanın Şehri" tablosu ve şehrinin sırası.
2. Kendi karakterinin kademesi (kalıcı, kullanıcı adına bağlı yerel kayıt).
3. Şehrin simge yapısının inşa ilerlemesi (birkaç yayına yayılabilir).
4. Her gün farklı "Günün Yöresi" teması (Pazartesi Karadeniz, Salı Ege...).
5. Özel günler: bayram, yılbaşı, maç günü (ama siyasi/ dini içerikten uzak).

### 4.10 Komik ve beklenmedik olaylar (oylamayla veya rastgele, **ödül/şans yok**)
- **Düğün Baskını:** Ekrana süslü konvoy girer, kalabalıklar 15 sn ortak halaya geçer.
- **Elektrik Kesildi:** Ekran kararır, sadece fenerler; müzik akustik davula iner, sonra "ışıklar geldi" drop'u.
- **Teyze Kontrolü:** Dev bir teyze balkondan "Yeter bu kadar gürültü!" der, müzik fısıltıya iner; beğenilerle teyze de dansa ikna edilir.
- **Martı Saldırısı:** Martı liderin şehrinden simit kapar.
- **Horon Fırtınası:** Karadeniz şehri liderken tempo bir anda ikiye katlanır, karakterler komik şekilde yetişmeye çalışır.
- **Kapadokya Şafağı:** Uzun süredir kimse lider değişmezse balon yağmurlu sakin bir geçiş.

### 4.11 Otomatik viral klip üretimi
- OBS "Replay Buffer" sürekli son 30 saniyeyi tutar.
- Oyun şu olaylarda OBS'e (obs-websocket ile) "kaydet" komutu gönderir: lider değişimi, Yöre Düellosu kararı, Şehir Uyanıyor, komik olay.
- Kayıt + olay bilgisi (ör. "35 İzmir, 61 Trabzon'u son 5 sn'de geçti!") depodaki **Kulaksız Video Studio** hattına aktarılarak başlık, alt yazı ve 15–20 sn kesimle Reels/Shorts formatına dönüştürülür.
- Kullanıcı adları klipte **varsayılan olarak gizlenir/kısaltılır** (gizlilik); paylaşımı yayıncı onaylar.

### 4.12 Türkçe yapay zekâ spikeri
- **İki katmanlı:** (1) Önceden yazılmış, onaylanmış 300–500 replik şablonu (`"{şehir} sahneye çıkıyor!"`). (2) Yerel Qwen yalnızca bu şablonlardan **seçme ve çeşitleme** yapar; serbest metin üretmez, kullanıcı yorumunu asla seslendirmez (moderasyon riski).
- **Ses:** Yerel çalışan açık kaynak TTS (ör. Piper'ın Türkçe sesleri) önceden üretilmiş ses dosyalarıyla; gecikme olmaması için replikler önbelleğe alınır. Bulut TTS kullanılacaksa yayın/ticari kullanım koşulları kontrol edilmeli.
- **Ton:** Maç spikeri + düğün sunucusu karışımı. "Ve İzmir son saniyede geçiyor! Zeybek sahnede!"
- Spiker müzikle çakışmasın diye konuşurken müzik otomatik kısılır (ducking).

### 4.13 Görsel stil
- **Neon-folklor:** Koyu lacivert zemin, yöresel motiflerin (kilim desenleri, oya) neon çizgilerle yorumu. Hem modern hem tanıdık.
- Karakterler: Basit, yuvarlak, yüz ifadeli "fasulye" figürler; yöreye göre aksesuar (kemençe, yazma, kasket, şalvar) — **stereotip ve alay içermeyen**.
- Okunaklılık: Şehir adları ve sayılar en az 48 px, yüksek kontrast; 45+ izleyici telefonda rahat okumalı.
- 30 fps garanti, 60 fps hedef.

### 4.14 Gerçek zamanlı TikTok bağlantısı
```
TikTok LIVE ──(okuma)──► Köprü (Node.js)
                          │  • tiktok-live-connector  VEYA  TikFinity WebSocket
                          │  • olayları tek biçime çevirir: {tur, kullanıcı, değer}
                          ▼
                   Yerel WebSocket (localhost)
                          ▼
              Oyun (tarayıcı, HTML5 + Web Audio)
                          ▼
          OBS / TikTok LIVE Studio pencere yakalama
```
- Köprü değiştirilebilir olmalı: Resmî olmayan kütüphane bozulursa TikFinity'ye geçilebilsin.
- **Simülatör:** Aynı olay biçimini üreten sahte izleyici motoru (yoğunluk ayarlı: "sakin akşam", "kalabalık PK"). İlk sürüm tamamen bununla çalışır.

### 4.15 Bilgisayar gereksinimleri (tahmini)
| Seviye | Donanım | Not |
|---|---|---|
| Minimum | 4 çekirdek CPU, 8 GB RAM, entegre GPU | 720×1280, 30 fps, Qwen kapalı |
| Önerilen | Ryzen 5 / i5 (yeni nesil), 16 GB RAM, GTX 1660 / RTX 3050+ | 1080×1920, 60 fps, OBS donanım kodlama |
| Qwen yerel | +8–12 GB VRAM veya ayrı bilgisayar | Spiker çeşitlemesi için küçük model yeterli; oyunun kritik yolunda olmamalı |
| İnternet | Sabit en az 10 Mbps yükleme | Kablolu bağlantı tercih |

---

## 5. AŞAMA 5 — Teknik Karşılaştırma

| Seçenek | Artı | Eksi | Karar |
|---|---|---|---|
| **HTML5 Canvas / PixiJS** | Ücretsiz, hızlı geliştirme, Claude ile çok verimli, OBS'te tarayıcı kaynağı | Çok karmaşık 3D'de sınırlı | ✅ **Ana seçim** (2D/2.5D neon stil için ideal) |
| Three.js | 3D harita, kamera dalışları | Performans ve varlık maliyeti artar | ◑ Sadece harita "dalış" sahnesi için sonradan |
| Unity | Güçlü görsel, editör | Derleme/yeniden yayın döngüsü yavaş, Claude ile iterasyon daha zor | ✗ İlk sürüm için gereksiz |
| Godot | Ücretsiz, hafif | Ekosistem/web köprüsü ek iş | ✗ |
| Web Audio API (+ Tone.js) | Katmanlı müzik, vuruşa kuantize olay | Ses tasarımı emeği | ✅ Müzik motoru |
| **tiktok-live-connector** | Ücretsiz, açık kaynak, referans depo hazır kullanıyor | Resmî değil; imza servisi sınırlanabilir; kural riski | ✅ Başlangıç köprüsü |
| **TikFinity** | Yaygın yayıncı aracı, WebSocket olayları | Üçüncü taraf, bazı özellikler ücretli olabilir | ✅ Yedek köprü |
| OBS | Ücretsiz, Replay Buffer, obs-websocket | Ek kurulum | ✅ Klip üretimi |
| TikTok LIVE Studio | Resmî yayın aracı | Otomasyon sınırlı | ✅ Yayın çıkışı (OBS sanal kamera / pencere yakalama) |
| Claude | Mimari, oyun kodu, test | — | ✅ Ana geliştirme |
| Yerel Qwen | Ücretsiz, çevrimdışı | Kalite ve Türkçe tutarlılık değişken | ✅ Yalnız yan görevler (spiker çeşitleme, test verisi) |

**Önerilen yol:** `furkancavlak/tiktok-oyun-fabrikasi` (MIT) çekirdeği **referans** alınır veya lisansa uygun şekilde (MIT bildirimi korunarak) temel yapılır; üzerine "şehir takımı", "katmanlı müzik" ve "klip" modülleri eklenir.

**Sürüm planı:**
1. **v0.1:** Simülatörle çalışan harita + plaka eşleme + 3 bölge müzik katmanı.
2. **v0.2:** 7 bölge, Yöre Düellosu, lider modülasyonu, hediye kademeleri.
3. **v0.3:** Gerçek TikTok köprüsü, OBS Replay Buffer klipleri.
4. **v0.4:** Spiker, günlük/haftalık tablo, komik olaylar.

---

## 6. AŞAMA 6 — Yayında Nasıl Görünecek (sahne sahne)

**🎬 Sahne 1 — Yayına ilk giriş (00:00)**
Ekran kapkaranlık. Tek bir davul vuruşu: *DÜM.* Haritada İstanbul yanar. *DÜM.* Ankara. *DÜM-DÜM.* İzmir ve Trabzon birlikte. Büyük yazı belirir: **"PLAKANI YAZ, ŞEHRİN ÇALSIN!"** Spiker: *"Hoş geldiniz! Bu akşam Türkiye'nin her köşesi sahnede. Senin memleketin nerede?"*

**🎬 Sahne 2 — İlk oyuncu (00:20)**
Yorum akar: `42`. Haritada Konya parlar, ışık hüzmesi sahneye akar; kasketli minik bir karakter sahnede zıplar, başında "M.K." harfleri. Müziğe bağlama girer. Spiker: *"Konya geldi! Bağlama hazır!"* Birkaç saniye sonra `21`, `61`, `35` — her biriyle yeni bir enstrüman. Kaydıran kişi müziğin "kurulduğunu" duyar.

**🎬 Sahne 3 — Müzik oturuyor (02:00)**
Yedi bölgeden en az biri aktif; orkestra dolu. Beğeniler yağdıkça Trabzon kalabalığının coşku çubuğu dolar ve hep birlikte omuz titreterek horon figürü yapar. Hediye atmayan yüzlerce kişi şehrinin dansını görüyor.

**🎬 Sahne 4 — Büyük rekabet (03:30)**
**YÖRE DÜELLOSU!** Ekran ikiye bölünür: **35 İZMİR** (zeybek, ağır ve güçlü) vs **61 TRABZON** (horon, hızlı). Müzik ikisini dönüşümlü çalar; hangi taraf enerji kazanırsa onun dansçıları orta çizgiyi karşıya iter. Yorumlar: "hadi İzmir!", "Karadeniz geliyooor". Trabzon'dan biri orta kademe hediye atar → bir sonraki vuruşta Uzungöl'ün üstünde sis yükselir, kemençe 1 ölçü solo yapar.

**🎬 Sahne 5 — Lider değişiyor (05:10)**
Son 20 saniyede İzmir'e 40 yeni kişi katılır ("Memleket Çağrısı" işe yaradı). Davullar 2 ölçü yuvarlanır, ekran bir an beyaza döner, müzik yarım ton yükselir, Saat Kulesi ışıl ışıl sahneye çıkar. Spiker: *"Ve İZMİR! Zeybek sahneye çıkıyor!"* OBS bu 20 saniyeyi otomatik kaydeder.

**🎬 Sahne 6 — Sürpriz (05:40)**
İzleyiciler oylamada `2`yi seçmiş: **Teyze Kontrolü.** Dev bir teyze balkondan sarkar: *"Yeter be! Saat kaç oldu!"* Müzik fısıltıya iner, tüm karakterler parmak uçlarında dans eder. Spiker: *"Teyzeyi ikna etmek için beğeni lazım!"* Beğeniler yağar, teyze önce ayağıyla tempo tutar, sonra mendil çıkarıp halaya katılır. Ortak kahkaha anı — rekabetin ortasında herkesi birleştiren nefes.

**🎬 Sahne 7 — Şampiyon (07:00)**
Final kreşendo: tempo yükselir, harita gece moduna geçer, aktif şehirler havai fişek gibi patlar. **"BU TURUN ŞAMPİYONU: 35 İZMİR"** Kazanan şehrin Şehir Elçisi'nin adı sahnenin üstünde; ama kutlamada **katılan herkesin karakteri** konfeti içinde dans ediyor. Kapadokya balonları ekranı doldurur. İkinci olan Trabzon için spiker: *"Trabzon da az kalsın! Yarın rövanş!"*

**🎬 Sahne 8 — Kısa video (07:30)**
Arka planda Video Studio, kaydedilen 20 sn'yi dikey klip yapar: üstte "SON 5 SANİYEDE GEÇTİ 😱", ortada düello ve modülasyon anı, sonda "Senin şehrin hangisi? Canlı yayında yaz!" Yayıncı onaylayınca Reels/Shorts'a hazır.

---

## 7. Etik ve kural güvenceleri (tasarıma gömülü)
- Hediye **hiçbir zaman** gerçek dünya ödülü, çekiliş veya şans mekanizması tetiklemez.
- "Son 10 saniye, hediye at yoksa kaybedersin!" türü baskı geri sayımları yok; sayaçlar tur akışını gösterir, harcama çağırmaz.
- Hediye puanı azalan getirili; kalabalık her zaman önemli.
- Şehir rekabeti olumlu çerçevede: yenilen şehir aşağılanmaz, hakaret/bölge ayrımcılığı içeren yorumlar filtrelenir, siyasi/etnik içerikli takma adlar engellenir.
- 18 yaş altı izleyicilere hediye yönlendirmesi yapılmaz; tüm "hediyesiz" yollar tam değerlidir.
- Kullanıcı yorumları sesli okunmaz; ekranda yalnızca kısaltılmış ad/baş harf gösterilir.
- Yayından önce TikTok LIVE kurallarının güncel hâli kontrol edilir.
