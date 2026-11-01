import { randomUUID } from 'node:crypto';
export const STYLES = ['survival', 'explainer', 'whatif', 'backyard'];
export const STYLE_NAMES = {
  survival: '3D hissi veren hayatta kalma / stickman',
  explainer: 'Animasyonlu anlatıcı / ders',
  whatif: '2D alternatif senaryo',
  backyard: 'Kesit bahçe / 2.5D diorama'
};
const clean = (s, max=500) => String(s ?? '').replace(/[<>]/g, '').trim().slice(0,max);
export const SHOTS = ['wide','medium','close','pan-left','pan-right'];
export function cleanScenes(scenes) {
  if (!Array.isArray(scenes) || scenes.length<2 || scenes.length>12) throw new Error('Storyboard 2–12 sahneden oluşmalı.');
  return scenes.map((scene,i)=>{
    if (!scene || typeof scene!=='object') throw new Error(`${i+1}. sahne geçersiz.`);
    const caption=clean(scene.caption,160);
    if (caption.length<2) throw new Error(`${i+1}. sahne başlığı çok kısa.`);
    const narration=clean(scene.narration||caption,400);
    if (!narration) throw new Error(`${i+1}. sahnede seslendirme boş.`);
    const weight=Number(scene.weight ?? 1);
    if (!Number.isFinite(weight) || weight<0.25 || weight>8) throw new Error(`${i+1}. sahnenin süre ağırlığı 0.25–8 olmalı.`);
    return {caption,narration,detail:clean(scene.detail,180),shot:SHOTS.includes(scene.shot)?scene.shot:'wide',weight};
  });
}
export const RENDER_FPS = [12,24,30];
export const RENDER_SIZES = [540,1080];
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
    id: randomUUID(), title, style, duration, script, visual_preset:null,
    scenes: beats.map((caption,i) => ({caption,narration:caption,detail: ['Giriş', 'Gelişme', 'Dönüm noktası', 'Final'][Math.min(i,3)],shot:['wide','medium','close','wide'][i%4],weight:1})),
    storyboard_approved:false, storyboard_approved_at:null, render_fps:12, render_size:540,
    platforms: [], render_status:'pending', publish_status:'draft', scheduled_at:null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    file:null, error:null
  };
}
export function cleanUpdate(current, patch={}) {
  const updated = {...current};
  if ('title' in patch) { const value=clean(patch.title,100); if(value.length<4) throw new Error('Başlık kısa.'); if(value!==updated.title)updated.storyboard_approved=false; updated.title=value; }
  if ('script' in patch){ const value=clean(patch.script,2400); if(value!==updated.script)updated.storyboard_approved=false; updated.script=value; }
  if ('duration' in patch){const value=Math.max(8,Math.min(90,Number(patch.duration)||18));if(value!==updated.duration)updated.storyboard_approved=false;updated.duration=value;}
  if ('style' in patch && STYLES.includes(patch.style)){if(updated.style!==patch.style)updated.storyboard_approved=false;updated.style=patch.style;if(updated.style!=='backyard')updated.visual_preset=null;}
  if ('visual_preset' in patch) {
    const preset=patch.visual_preset ?? null;
    if (preset!==null && (preset!=='apple-soil-v1'||updated.style!=='backyard')) throw new Error('Görsel profil geçersiz.');
    if (updated.visual_preset!==preset){updated.storyboard_approved=false;updated.storyboard_approved_at=null;}
    updated.visual_preset=preset;
  }
  if ('scenes' in patch) {
    updated.scenes=cleanScenes(patch.scenes);
    if (patch.sync_narration === true) {
      const joined=updated.scenes.map(s=>s.narration).join(' ');
      if (joined.length>2400) throw new Error('Toplam seslendirme 2400 karakteri aşamaz.');
      updated.script=joined;
    }
    updated.storyboard_approved=false;
    updated.storyboard_approved_at=null;
  }
  if ('render_fps' in patch){
    if(!RENDER_FPS.includes(Number(patch.render_fps)))throw new Error('FPS 12, 24 veya 30 olmalı.');
    updated.render_fps=Number(patch.render_fps);
  }
  if ('render_size' in patch){
    if(!RENDER_SIZES.includes(Number(patch.render_size)))throw new Error('Çıktı 540 veya 1080 piksel genişliğinde olmalı.');
    updated.render_size=Number(patch.render_size);
  }
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
