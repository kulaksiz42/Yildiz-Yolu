const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let videos=[],currentEdit=null,calendarMonth=new Date().getMonth(),calendarYear=new Date().getFullYear();
const styles={survival:'Hayatta kalma',explainer:'Eğitici',whatif:'What If',backyard:'Diorama'};
async function api(url,options={}) {const res=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...options});let data={};try{data=await res.json();}catch{}if(res.status===401)showLogin();if(!res.ok)throw new Error(data.error||'İşlem başarısız');return data;}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(window.toastTimeout);window.toastTimeout=setTimeout(()=>el.classList.add('hidden'),4500);}
function showLogin(){ $('#login').classList.remove('hidden');$('#workspace').classList.add('hidden'); }
function showPanel(){ $('#login').classList.add('hidden');$('#workspace').classList.remove('hidden'); }
function row(item){const c=item.render_status;const status=c==='ready'?'MP4 hazır':c==='rendering'?'Render ediliyor':c==='error'?'Hata':'Taslak';const controls=c==='ready'?`<a class="btn mini ghost" href="/api/videos/${item.id}/file" target="_blank">MP4 ↗</a><button class="btn mini ghost" data-action="quality" data-id="${item.id}">Kalite raporu</button>`:`<button class="btn mini ghost" data-action="render" data-id="${item.id}" ${c==='rendering'?'disabled':''}>Render</button>`;
return `<article class="video-row"><div class="video-poster ${item.style}">${item.style==='survival'?'♙':item.style==='explainer'?'✎':item.style==='backyard'?'⌂':'?'}</div><div class="video-data"><h3 title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</h3><p>${escapeHTML(styles[item.style])} · ${item.duration} sn · ${new Date(item.created_at).toLocaleDateString('tr-TR')}</p><div style="margin-top:6px"><span class="chip ${c}">${status}</span> ${item.scheduled_at?'<span class="chip planned">Takvimde</span>':''}</div></div><div class="video-actions"><a class="btn mini ghost" target="_blank" href="/preview.html?id=${item.id}">Önizle ↗</a><button class="btn mini ghost" data-action="edit" data-id="${item.id}">Düzenle</button><button class="btn mini ghost" data-action="storyboard" data-id="${item.id}">Storyboard ${item.storyboard_approved===true?"✓":"○"}</button>${controls}</div></article>`;}
function renderUI(){ $('#metricTotal').textContent=videos.length;$('#metricReady').textContent=videos.filter(v=>v.render_status==='ready').length;$('#metricPlanned').textContent=videos.filter(v=>v.scheduled_at).length;$('#metricError').textContent=videos.filter(v=>v.render_status==='error').length;
const empty='<div class="empty-state"><strong>Henüz video yok.</strong>Sağ üstten yeni bir hikâye oluştur.</div>';
$('#recentVideos').innerHTML=videos.length?videos.slice(0,5).map(row).join(''):empty;
$('#allVideos').innerHTML=videos.length?videos.map(row).join(''):empty;
renderCalendar();}
function formatDate(d){return new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric'}).format(d);}
function renderCalendar(){const start=new Date(calendarYear,calendarMonth,1);$('#monthLabel').textContent=new Intl.DateTimeFormat('tr-TR',{month:'long',year:'numeric'}).format(start);const startOffset=(start.getDay()+6)%7;const last=new Date(calendarYear,calendarMonth+1,0).getDate();const cells=[];const now=new Date();for(let i=0;i<42;i++){const day=i-startOffset+1;const date=new Date(calendarYear,calendarMonth,day);const inMonth=day>0&&day<=last;const entries=videos.filter(v=>v.scheduled_at&&formatDate(new Date(v.scheduled_at))===formatDate(date));cells.push(`<div class="calendar-cell ${inMonth?'':'outside'} ${formatDate(now)===formatDate(date)?'today':''}"><b>${date.getDate()}</b>${entries.map(v=>`<span class="calendar-item" title="${escapeHTML(v.title)}">${escapeHTML(v.title)}</span>`).join('')}</div>`);}$('#calendarGrid').innerHTML=cells.join('');}
function tab(name){document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));document.querySelectorAll('.tabview').forEach(x=>x.classList.toggle('hidden',x.id!==`view-${name}`));const headings={overview:'İçerik üretim merkezi',projects:'Video kütüphanesi',calendar:'Yayın takvimi',settings:'Platform bağlantıları'};$('#pageHeading').textContent=headings[name];}
async function reload(){const result=await api('/api/videos');videos=result.videos;renderUI();}
function openCreate(){ $('#createDialog').showModal();$('#title').focus(); }
function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(x=>x.close());}
$('#loginForm').onsubmit=async e=>{e.preventDefault();$('#loginError').textContent='';try{await api('/api/login',{method:'POST',body:JSON.stringify({password:$('#password').value})});$('#password').value='';showPanel();await reload();}catch(err){$('#loginError').textContent=err.message;}};
$('#logout').onclick=async()=>{await api('/api/logout',{method:'POST'});showLogin();};
$('#newVideo').onclick=openCreate;$('#importVideo').onclick=()=>$('#importDialog').showModal();$('#showcaseStart').onclick=openCreate;
document.querySelectorAll('[data-close]').forEach(el=>el.onclick=closeDialogs);
document.querySelectorAll('.nav').forEach(el=>el.onclick=()=>tab(el.dataset.tab));
document.querySelectorAll('[data-goto]').forEach(el=>el.onclick=()=>tab(el.dataset.goto));
$('#createForm').onsubmit=async e=>{e.preventDefault();try{const payload={title:$('#title').value,style:$('#style').value,duration:Number($('#duration').value),script:$('#script').value};const data=await api('/api/videos',{method:'POST',body:JSON.stringify(payload)});closeDialogs();e.target.reset();await reload();toast('Hikâye oluşturuldu. Önizleme ve Render hazır.');window.open(`/preview.html?id=${data.video.id}`,'_blank');}catch(err){toast(err.message);}};
function editVideo(id){const v=videos.find(x=>x.id===id);if(!v)return;currentEdit=id;$('#editHeading').textContent=v.title;$('#editTitle').value=v.title;$('#editScript').value=v.script;$('#editDate').value=v.scheduled_at?new Date(new Date(v.scheduled_at).getTime()-new Date(v.scheduled_at).getTimezoneOffset()*60000).toISOString().slice(0,16):'';$('#editDialog').showModal();}
$('#editForm').onsubmit=async e=>{e.preventDefault();try{const date=$('#editDate').value;const payload={title:$('#editTitle').value,script:$('#editScript').value,scheduled_at:date?new Date(date).toISOString():null};await api(`/api/videos/${currentEdit}`,{method:'PATCH',body:JSON.stringify(payload)});closeDialogs();await reload();toast('Değişiklikler kaydedildi.');}catch(err){toast(err.message);}};
document.addEventListener('click',async e=>{const btn=e.target.closest('[data-action]');if(!btn)return;const id=btn.dataset.id;if(btn.dataset.action==='edit')return editVideo(id);if(btn.dataset.action==='storyboard')return openStoryboard(id);
if(btn.dataset.action==='quality'){
 try {const q=await api(`/api/videos/${id}/quality`);
   const checks=q.checks.map(c=>`<li>${c.status==='pass'?'✓':'!'} ${escapeHTML(c.check)}: ${escapeHTML(c.detail)}</li>`).join('');
   const scenes=(q.editorial_heuristics||[]).map(x=>`<div class="qc-card"><strong>Sahne ${x.scene} · ${x.start??'?'}–${x.end??'?'} sn</strong><p class="muted small">${x.flags.length?x.flags.map(escapeHTML).join(' · '):'Otomatik kurallara takılmadı; insan incelemesi yine gerekli.'}</p></div>`).join('');
   $('#qualityDetails').innerHTML=`<p class="muted">Durum: ${escapeHTML(q.status)} · Kelime hizası: ${escapeHTML(q.word_alignment)} · Estetik onayı verilmedi</p><img class="qc-image" alt="Render contact sheet" src="/api/videos/${id}/contact"><h3>Teknik kontroller</h3><ul class="qc-flags">${checks}</ul><h3>Sahne inceleme önerileri</h3>${scenes}<p class="muted small">Bu rapor kurallara dayalıdır, yapay zekâ görsel eleştirisi değildir. Ses mutlaka dinlenmelidir.</p>`;
   $('#qualityDialog').showModal();
 }catch(err){toast(err.message)} return;
}if(btn.dataset.action==='render'){try{await api(`/api/videos/${id}/render`,{method:'POST'});toast('Render başlatıldı; tamamlandığında MP4 görünecek.');await reload();}catch(err){toast(err.message);}}});
$('#prevMonth').onclick=()=>{calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--;}renderCalendar();};
$('#nextMonth').onclick=()=>{calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++;}renderCalendar();};
async function init(){try{await reload();showPanel();}catch{showLogin();}}init();
setInterval(async()=>{if($('#workspace').classList.contains('hidden'))return;try{await reload();}catch{}},7000);

// v0.3 storyboard editing: render stills from the exact same seekable Canvas engine.
let storyboardId=null, storyboardScenes=[];
function sceneMarkup(scene,i){
  return `<section class="storyboard-card" data-index="${i}"><canvas width="540" height="960" aria-label="Sahne ${i+1} örnek karesi"></canvas><div>
    <div class="storyboard-meta"><strong>Sahne ${i+1}</strong><div class="storyboard-controls"><button type="button" class="btn mini ghost" data-scene-action="up" ${i===0?'disabled':''}>↑</button><button type="button" class="btn mini ghost" data-scene-action="down" ${i===storyboardScenes.length-1?'disabled':''}>↓</button><button type="button" class="btn mini ghost" data-scene-action="remove" ${storyboardScenes.length<=2?'disabled':''}>✕</button></div></div>
    <label>Ekrandaki başlık<input data-field="caption" maxlength="160" value="${escapeHTML(scene.caption)}" required></label>
    <label>Seslendirme<textarea data-field="narration" maxlength="400">${escapeHTML(scene.narration||scene.caption)}</textarea></label>
    <label>Görsel plan / yönetmen notu<textarea data-field="detail" maxlength="180">${escapeHTML(scene.detail||'')}</textarea></label>
    <label>Kamera planı<select data-field="shot">${[['wide','Geniş'],['medium','Orta'],['close','Yakın'],['pan-left','Sola kaydır'],['pan-right','Sağa kaydır']].map(([value,label])=>`<option value="${value}" ${scene.shot===value?'selected':''}>${label}</option>`).join('')}</select></label>
    <label>Göreli süre ağırlığı<input data-field="weight" type="number" min="0.25" max="8" step="0.25" value="${Number(scene.weight)||1}"></label>
    <span class="storyboard-badge" data-time>Örnek kare hazırlanıyor</span>
  </div></section>`;
}
function redrawStoryboard(){
 const current=videos.find(v=>v.id===storyboardId);if(!current)return;
 $('#storyboardScenes').innerHTML=storyboardScenes.map(sceneMarkup).join('');
 const draft={...current,scenes:storyboardScenes,script:storyboardScenes.map(s=>s.narration||s.caption).join(' ')};
 const timeline=StudioTimeline.build(draft);
 for(const [i,card] of [...document.querySelectorAll('.storyboard-card')].entries()){
   const segment=timeline.scenes[i],t=(segment.start+segment.end)/2;
   StudioDraw.render(card.querySelector('canvas'),draft,t);
   card.querySelector('[data-time]').textContent=`${segment.start.toFixed(1)}–${segment.end.toFixed(1)} sn`;
 }
 $('#addScene').disabled=storyboardScenes.length>=12;
}
function openStoryboard(id){
 const v=videos.find(x=>x.id===id);if(!v)return;
 storyboardId=id;storyboardScenes=v.scenes.map(s=>({caption:s.caption||'',narration:s.narration||s.caption||'',detail:s.detail||'',shot:s.shot||'wide',weight:s.weight??1}));
 $('#storyboardHeading').textContent=v.title;
 $('#storyboardFps').value=String(v.render_fps||12);$('#storyboardSize').value=String(v.render_size||540);
 $('#storyboardState').textContent=v.storyboard_approved?'Storyboard daha önce onaylandı. Düzenleme yapıp kaydedersen onay yenilenmeli.':'Bu storyboard henüz onaylanmadı. Onaylamadan MP4 render alınamaz.';
 redrawStoryboard();$('#storyboardDialog').showModal();
}
$('#storyboardScenes').addEventListener('input',e=>{
 const card=e.target.closest('[data-index]'),field=e.target.dataset.field;if(!card||!field)return;
 const index=Number(card.dataset.index);storyboardScenes[index][field]=field==='weight'?Number(e.target.value):e.target.value;
 if(field==='weight')updateStoryboardTimes();
});
function updateStoryboardTimes(){
 const v=videos.find(x=>x.id===storyboardId);if(!v)return;
 const draft={...v,scenes:storyboardScenes,script:storyboardScenes.map(s=>s.narration||s.caption).join(' ')};
 const parts=StudioTimeline.build(draft).scenes;
 document.querySelectorAll('.storyboard-card').forEach((card,i)=>{card.querySelector('[data-time]').textContent=`${parts[i].start.toFixed(1)}–${parts[i].end.toFixed(1)} sn`;});
}
$('#storyboardScenes').addEventListener('click',e=>{
 const button=e.target.closest('[data-scene-action]'),card=e.target.closest('[data-index]');if(!button||!card)return;
 const i=Number(card.dataset.index),action=button.dataset.sceneAction;
 if(action==='remove'&&storyboardScenes.length>2)storyboardScenes.splice(i,1);
 if(action==='up'&&i>0)[storyboardScenes[i-1],storyboardScenes[i]]=[storyboardScenes[i],storyboardScenes[i-1]];
 if(action==='down'&&i<storyboardScenes.length-1)[storyboardScenes[i+1],storyboardScenes[i]]=[storyboardScenes[i],storyboardScenes[i+1]];
 redrawStoryboard();
});
$('#addScene').onclick=()=>{if(storyboardScenes.length>=12)return;storyboardScenes.push({caption:'Yeni sahne',narration:'Yeni sahne için bir cümle yaz.',detail:'Özgün yeni bir görsel',shot:'wide',weight:1});redrawStoryboard();};
async function storeStoryboard(approve){
 if(!storyboardId)return;
 const id=storyboardId;
 try{
   if(storyboardScenes.some(s=>!s.caption.trim()||!s.narration.trim()))throw new Error('Her sahneye başlık ve anlatım yaz.');
   await api(`/api/videos/${id}`,{method:'PATCH',body:JSON.stringify({scenes:storyboardScenes,sync_narration:true,render_fps:Number($('#storyboardFps').value),render_size:Number($('#storyboardSize').value)})});
   if(approve)await api(`/api/videos/${id}/approve`,{method:'POST'});
   await reload();closeDialogs();toast(approve?'Storyboard onaylandı. Artık MP4 render alınabilir.':'Storyboard taslağı kaydedildi. Render için onay gerekli.');
 }catch(error){toast(error.message);}
}
$('#storyboardForm').onsubmit=e=>{e.preventDefault();storeStoryboard(false);};
$('#approveStoryboard').onclick=()=>storeStoryboard(true);

// Claude Free output import: never directly executes input or publishes anything.
$('#importForm').onsubmit=async e=>{
 e.preventDefault();
 try{
   let proposal;
   try{proposal=JSON.parse($('#importJSON').value.trim());}catch{throw new Error('Geçerli JSON yapıştır. Kod bloğunun ``` işaretlerini çıkar.');}
   if(!proposal||typeof proposal!=='object'||!Array.isArray(proposal.scenes)||proposal.scenes.length<2||proposal.scenes.length>12)throw new Error('Taslak 2–12 sahne içermeli.');
   const scenes=proposal.scenes.map(x=>({caption:String(x.caption||''),narration:String(x.narration||x.caption||''),detail:String(x.detail||''),shot:String(x.shot||'wide'),weight:Number(x.weight??1)}));
   const source={title:String(proposal.title||''),style:String(proposal.style||'survival'),duration:Number(proposal.duration||30),script:scenes.map(s=>s.narration).join(' ')};
   // Pre-validation avoids creating an unsalvageable draft on malformed input.
   if(source.title.length<4||source.script.length>2400||scenes.some(s=>s.caption.length<2||s.caption.length>160||s.narration.length>400||s.weight<.25||s.weight>8||!Number.isFinite(s.weight)))throw new Error('Başlık, anlatım veya sahne uzunluğu/süresi geçersiz.');
   const created=await api('/api/videos',{method:'POST',body:JSON.stringify(source)});
   await api(`/api/videos/${created.video.id}`,{method:'PATCH',body:JSON.stringify({scenes,sync_narration:true})});
   await reload();closeDialogs();$('#importJSON').value='';openStoryboard(created.video.id);toast('Claude taslağı aktarıldı. Sahneleri inceleyip onayla.');
 }catch(err){toast(err.message);}
};
