import { randomUUID } from 'node:crypto';
export const STYLES = ['survival', 'explainer', 'whatif', 'backyard'];
export const STYLE_NAMES = {
  survival: '3D hissi veren hayatta kalma / stickman',
  explainer: 'Animasyonlu anlatıcı / ders',
  whatif: '2D alternatif senaryo',
  backyard: 'Kesit bahçe / 2.5D diorama'
};
const clean = (s, max=500) => String(s ?? '').replace(/[<>]/g, '').trim().slice(0,max);
export function makeStory(input={}) {
  const title = clean(input.title, 100);
  if (title.length < 4) throw new Error('Başlık en az 4 karakter olmalı.');
  const style = STYLES.includes(input.style) ? input.style : 'survival';
  const duration = Math.max(8, Math.min(90, Number(input.duration) || 18));
  const templates = {
    survival: [`Bir anda her şey değişti: ${title}.`, 'Saat ilerliyor. Telefonun şarjı yüzde on iki.', 'Önünde iki seçenek var. Hangisini seçerdin?'],
    explainer: [`Bugün şu konuyu öğreniyoruz: ${title}.`, 'Önce temel fikri anlamak gerekiyor.', 'İkinci adım: nedenini ve sonucunu birbirine bağla.', 'Peki sen olsaydın nereden başlardın?'],
    whatif: [`Ya gerçekten böyle olsaydı: ${title}?`, 'Önce sıradan bir gün gibi başlıyor.', 'Sonra her şeyi değiştiren ayrıntı geliyor.', 'Sence sonuç ne olurdu?'],
    backyard: [`Bugün şunu kuruyoruz: ${title}.`, 'İlk olarak toprağın altında ne olduğunu görelim.', 'Sonra katmanlar tek tek yerlerine oturuyor.', 'Şimdi bütün sistem nasıl çalışıyor, bak.']
  };
  const beats = templates[style];
  const script = clean(input.script, 2400) || beats.join(' ');
  return {
    id: randomUUID(), title, style, duration, script,
    scenes: beats.map((caption,i) => ({caption, detail: ['Giriş', 'Gelişme', 'Dönüm noktası', 'Final'][Math.min(i,3)]})),
    platforms: [], render_status:'pending', publish_status:'draft', scheduled_at:null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    file:null, error:null
  };
}
export function cleanUpdate(current, patch={}) {
  const updated = {...current};
  if ('title' in patch) { const value=clean(patch.title,100); if(value.length<4) throw new Error('Başlık kısa.'); updated.title=value; }
  if ('script' in patch) updated.script = clean(patch.script,2400);
  if ('duration' in patch) updated.duration = Math.max(8,Math.min(90,Number(patch.duration)||18));
  if ('style' in patch && STYLES.includes(patch.style)) updated.style=patch.style;
  if ('scenes' in patch && Array.isArray(patch.scenes)) updated.scenes=patch.scenes.slice(0,12).map(s=>({caption:clean(s?.caption,160),detail:clean(s?.detail,80)}));
  if ('scheduled_at' in patch) {
    if(patch.scheduled_at===null || patch.scheduled_at==='') updated.scheduled_at=null;
    else {
      const t=Date.parse(patch.scheduled_at);
      if (!Number.isFinite(t)) throw new Error('Tarih hatalı.');
      updated.scheduled_at = new Date(t).toISOString();
    }
    updated.publish_status=updated.scheduled_at?'planned':'draft';
  }
  if ('platforms' in patch && Array.isArray(patch.platforms)) updated.platforms=patch.platforms.filter(x=>['instagram','youtube','x'].includes(x)).slice(0,3);
  updated.updated_at = new Date().toISOString();
  return updated;
}
export function safeId(id) { return /^[0-9a-f-]{36}$/i.test(id); }
