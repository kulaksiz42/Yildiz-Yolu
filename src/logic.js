'use strict';
// Bağımsız WebGL1 üç boyutlu sahne motoru. Three.js veya dış CDN gerektirmez.
const c=document.getElementById('world'),gl=c.getContext('webgl',{antialias:true,alpha:false})||c.getContext('experimental-webgl');
const $=q=>document.querySelector(q), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
function toast(s){let e=$('#toast');e.textContent=s;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2300)}
const key='yildizyolu_cinematic_v2',leagues={tr:{name:'Türkiye',league:'Anadolu Süper Ligi',coach:'Selim Yaman',clubs:[['Boğaziçi SK','#edc94e'],['Karadeniz 1923','#77c1ed'],['Toros Gençlik','#60cc96']],rival:'Marmara Demirspor',city:'İstanbul'},en:{name:'İngiltere',league:'Premier Adalar',coach:'Gary Whitlow',clubs:[['Thames United','#d94262'],['Harbour City','#6fbce4'],['Albion Park','#f1e9c5']],rival:'Mersey Rovers',city:'Londra'},es:{name:'İspanya',league:'Liga Soleada',coach:'Luis Ortega',clubs:[['Real Costa Dorada','#f1f0e9'],['Atlético Duero','#ee5065'],['Levante Mar','#6695e9']],rival:'CD Alhambra',city:'Valencia'}};
const draft={name:'',nick:'',country:'tr',club:0,pos:'st',trait:'takim',skin:'#d0a17c',hair:'#232026',hairStyle:'kisa',jersey:9,kit:'#e5af4b'},pos={st:'Santrfor',lw:'Kanat',cm:'Orta Saha',cb:'Stoper'},traits={takim:'Takım oyuncusu',hirs:'Hırslı',asi:'Asi',mutevazi:'Mütevazı'};
let career=null,screen='title',createStep=0,storyPhase=0,match=null,matchTick=0,joy={x:0,y:0},shotStart=0,ballTimer=0,latestResult='';
function save(){if(career)try{localStorage.setItem(key,JSON.stringify(career))}catch(e){toast('Tarayıcı kaydı engellendi')}}
function switchTo(s){screen=s;for(let e of document.querySelectorAll('.screen'))e.hidden=e.id!=='s-'+s;$('#shade').style.background=s==='match'?'linear-gradient(180deg,#030a1480,transparent 30%,transparent 70%,#04101fa1)':'linear-gradient(90deg,rgba(4,8,17,.66),transparent 78%),linear-gradient(0deg,#050a14a6,transparent 50%)'}
function opts(values,field){return `<div class="choices">${values.map(([v,t,d])=>`<button class="choice ${draft[field]===v?'on':''}" data-field="${field}" data-value="${v}">${t}${d?`<span>${d}</span>`:''}</button>`).join('')}</div>`}
function colors(field,values){return `<div class="swatches">${values.map(v=>`<button class="swatch ${draft[field]===v?'on':''}" data-field="${field}" data-value="${v}" style="background:${v}" aria-label="Renk ${v}"></button>`).join('')}</div>`}
function renderCreator(){switchTo('create');$('#steptext').textContent=`OYUNCU OLUŞTUR • ${createStep+1} / 3`;$('#forward').textContent=createStep===2?'KARİYERİ BAŞLAT':'DEVAM ET';let t='',b='';if(createStep===0){t='İlk sayfa: Sen kimsin?';b=`<label class="label">ADIN / SOYADIN</label><input id="name" class="input" maxlength="24" value="${escapeHTML(draft.name)}" placeholder="Örn. Ali Yıldız"><label class="label">LAKABIN</label><input id="nick" class="input" maxlength="20" value="${escapeHTML(draft.nick)}" placeholder="Örn. Yıldız"><label class="label">MEVKİ</label>${opts(Object.entries(pos).map(([v,t])=>[v,t,'' ]),'pos')}`}else if(createStep===1){t='Başrolü kendin tasarla';b=`<label class="label">TEN RENGİ</label>${colors('skin',['#e9c6a2','#d0a17c','#93674e','#5b3a31'])}<label class="label">SAÇ RENGİ</label>${colors('hair',['#232026','#6d4027','#ae8044','#e3c17a'])}<label class="label">FORMA RENGİ</label>${colors('kit',['#e5af4b','#e95e55','#4f9fe8','#5fbe91','#f2f3ec'])}<label class="label">SAÇ MODELİ</label>${opts([['kisa','Kısa',''],['afro','Kıvırcık',''],['uzun','Uzun',''],['kazit','Kazıtılmış','']],'hairStyle')}<label class="label">KARAKTER ÖZELLİĞİ</label>${opts(Object.entries(traits).map(([v,t])=>[v,t,'']),'trait')}`}else{let l=leagues[draft.country];t='Hikâyen nerede başlasın?';b=`<label class="label">ÜLKE / LİG</label>${opts(Object.entries(leagues).map(([v,o])=>[v,o.name,o.league]),'country')}<label class="label">İLK KULÜBÜN</label>${opts(l.clubs.map((x,i)=>[String(i),x[0],'Deneme sözleşmesi']),'club')}`};$('#create-title').textContent=t;$('#create-fields').innerHTML=b;for(let btn of document.querySelectorAll('[data-field]'))btn.onclick=()=>{const k=btn.dataset.field,v=btn.dataset.value;persistInputs();draft[k]=k==='club'?Number(v):v;if(k==='country')draft.club=0;renderCreator()}}
function escapeHTML(s){return String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function persistInputs(){if(createStep===0){draft.name=$('#name')?.value.trim()||'';draft.nick=$('#nick')?.value.trim()||''}}
$('#new').onclick=()=>{if(career&&!confirm('Mevcut sinematik kariyeri saklayıp yeni bir kariyer başlatmak istiyor musun?'))return;if(career)try{localStorage.setItem(key+'_yedek',JSON.stringify(career))}catch(e){}createStep=0;renderCreator()};$('#resume').onclick=()=>{if(career)showHub()};$('#back').onclick=()=>{persistInputs();if(createStep===0)switchTo('title');else{createStep--;renderCreator()}};
$('#forward').onclick=()=>{persistInputs();if(createStep===0&&!draft.name){toast('Önce oyuncunun adını yaz.');return}if(createStep<2){createStep++;renderCreator();return}career={...draft,name:draft.name,nick:draft.nick||draft.name,club:Number(draft.club),week:1,season:1,goals:0,assists:0,coach:50,fame:5,team:50,energy:95,shoot:64,points:0,choiceHistory:[],matchHistory:[]};save();$('#resume').hidden=false;storyPhase=0;showStory()};
function storyContent(){let l=leagues[career.country],player=escapeHTML(career.name),club=l.clubs[career.club][0];if(storyPhase===0){return {who:`${l.coach.toUpperCase()} • TEKNİK DİREKTÖR`,text:career.country==='tr'?`${player}, ${club} formasını giyiyorsun. Burada taraftar seni ıslıkla da karşılar, alkışla da. Şimdi söyle: Bu takımda ne arıyorsun?`:career.country==='en'?`Welcome to ${club}, ${player}. This city doesn't wait for promises. What are you here to prove?`:`Bienvenido a ${club}, ${player}. Bu ligde teknik ve cesaret önemlidir. Neyi kanıtlayacaksın?`,answers:[['Takım için her şeyi yaparım.',{coach:8,team:10,fame:0} ],['Gol kralı olmak ve zirveye çıkmak istiyorum.',{coach:-2,team:-3,fame:8}],['Kurallarınızı öğrenip sahada konuşacağım.',{coach:5,team:3,fame:2}]]}}if(storyPhase===1){return {who:`${l.coach.toUpperCase()} • ANTRENMAN SAHASI`,text:career.coach>=55?'İşte duymak istediğim bu. İlk maçta sana güvenebilirim. Beni hayal kırıklığına uğratma.':'Sözlerini sahada kanıtlamalısın. İlk maçta her dokunuşun hesabını vereceksin.',answers:[['Hazırım hocam. Sahaya çıkalım.',{coach:1,team:1,fame:0}]]}}return {who:`${l.coach.toUpperCase()} • SOYUNMA ODASI`,text:`${career.week}. hafta. Rakip ${l.rival}. Basın ve tribünler seni izliyor. Takımı ön plana çıkaracak mısın, yoksa sorumluluğu kendin mi alacaksın?`,answers:[['Takım kazansın, gerekiyorsa pas veririm.',{coach:5,team:6,fame:0}],['Bırakın son vuruşu ben yapayım.',{coach:0,team:-3,fame:5}]]}}
function showStory(){switchTo('story');let st=storyContent();$('#story-speaker').textContent=st.who;$('#story-text').textContent=st.text;$('#story-answers').replaceChildren();st.answers.forEach(([txt,fx],i)=>{const b=document.createElement('button');b.className='answer';b.textContent=txt;b.onclick=()=>{career.coach=clamp(career.coach+fx.coach,0,100);career.team=clamp(career.team+fx.team,0,100);career.fame+=fx.fame;career.choiceHistory.push({season:career.season,week:career.week,phase:storyPhase,choice:i});save();storyPhase++;if(storyPhase<=1)showStory();else showHub()};$('#story-answers').appendChild(b)})}
function statsHTML(items){return items.map(([k,v])=>`<div class="hubstat"><strong>${v}</strong><small>${k}</small></div>`).join('')}
function showHub(){switchTo('hub');let l=leagues[career.country];$('#hub-week').textContent=`${career.season}. SEZON / HAFTA ${career.week}`;$('#hub-title').textContent=career.name;$('#hub-club').textContent=`${l.clubs[career.club][0]} · ${pos[career.pos]} · ${l.league}`;$('#hub-stats').innerHTML=statsHTML([['GOL',career.goals],['HOCA',career.coach],['ŞÖHRET',career.fame]]);$('#hub-news').textContent=career.coach>=55?`${l.media||'Spor Arena'} • Teknik direktör ${l.coach}, ${career.nick} için ilk 11'e göz kırptı.`:`${l.name} spor basını • ${career.nick} için forma savaşının henüz yeni başladığı konuşuluyor.`}
$('#play').onclick=()=>{startMatch()};$('#train').onclick=()=>{if(career.energy<35){toast('Enerjin düşük. Maç öncesi dinlen.');return}career.shoot=clamp(career.shoot+2,0,95);career.energy-=12;career.coach=clamp(career.coach+2,0,100);save();toast('Bitiricilik +2 · Enerji -12');showHub()};
/* GAMEPLAY V0.3: gerçek pas, hareketli savunma, ayrı savunma ve frikik anları.
   Çizim işlemlerinden bağımsız; tüm hızlar saniye cinsindendir. */
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const moveTowards=(p,dest,speed,dt)=>{
  let dx=dest.x-p.x,dz=dest.z-p.z,length=Math.hypot(dx,dz);
  if(length>.001){let v=Math.min(length,speed*dt);p.x+=dx/length*v;p.z+=dz/length*v;}
};
function setMatchHint(text){$('#hint').textContent=text}
function matchButtons(){
 const defense=match&&match.mode==='defend';
 $('#pass').textContent=defense?'TOP KAP':'PAS';
 $('#shoot').textContent=defense?'KAY':'ŞUT';
 $('#power').style.width='0%';
}
function startMatch(){
 match={moment:0,minutes:[23,58,81],player:{x:0,z:13},keeper:{x:0,z:49},ball:{x:0,y:.23,z:14},
  team:[],defenders:[],carrier:null,mode:'attack',flight:null,shotCount:0,passes:0,successfulPasses:0,
  defenderWins:0,charge:0,aim:0,run:0,done:false,gf:0,ga:0,nextDelay:0,clock:0,defenseCooldown:0,
  stamina:100,keeperAim:0,feedback:''};
 switchTo('match');
 $('#home').textContent=leagues[career.country].clubs[career.club][0];
 $('#away').textContent=leagues[career.country].rival;
 nextMoment();
}
function nextMoment(){
 if(!match)return;
 if(match.moment>=3){endMatch();return}
 const m=match;
 m.mode=['attack','defend','freekick'][m.moment];m.clock=0;m.nextDelay=0;m.done=false;
 m.charge=0;m.aim=0;m.run=0;m.flight=null;m.stamina=Math.min(100,m.stamina+35);
 m.player={x:0,z:m.mode==='freekick'?32:m.mode==='defend'?23:13};
 m.ball={x:0,y:.23,z:m.player.z+1};m.ballOwner=m.mode==='defend'?'opponent':'me';
 m.team=[{x:-6,z:m.player.z+8,run:0},{x:6,z:m.player.z+9,run:0}];
 m.defenders=m.mode==='freekick'
  ?[{x:-1.2,z:40,speed:1.8,run:0},{x:0,z:40,speed:1.8,run:0},{x:1.2,z:40,speed:1.8,run:0}]
  :[{x:-3.5,z:27,speed:3.35,run:0},{x:3.5,z:30,speed:3.65,run:0},{x:0,z:37,speed:3.0,run:0}];
 m.carrier={x:1.3,z:37,speed:3.1,run:0};
 if(m.mode==='defend'){m.ball={x:m.carrier.x,y:.23,z:m.carrier.z+.4};m.defenders=[
  {x:-6,z:37,speed:2.2,run:0},{x:7,z:32,speed:2.2,run:0}];}
 m.keeper={x:0,z:49};m.keeperAim=0;
 $('#minute').textContent=m.minutes[m.moment]+"'";
 $('#score').textContent=`${m.gf} — ${m.ga}`;
 setMatchHint(m.mode==='attack'?'ATAK · Joystick sol = sola. PAS ile arkadaşına ver, ŞUT için basılı tutup bırak.':
   m.mode==='defend'?'SAVUNMA · Rakibe yaklaş. TOP KAP veya KAY ile müdahale et!':
   'FRİKİK · Duvarı aşmak için nişan al. ŞUT basılı tutarak güç topla.');
 matchButtons();
}
function queueNextMoment(seconds=1.5){if(match){match.done=true;match.nextDelay=seconds}}
function findPassReceiver(){
 const m=match;if(!m||!m.team.length)return null;
 const candidates=m.team.filter(p=>p.z>m.player.z-1);
 if(!candidates.length)return null;
 const direction=Math.abs(joy.x)>.23?joy.x:(m.aim||0);
 if(direction<-.20)return candidates.reduce((a,b)=>a.x<b.x?a:b);
 if(direction>.20)return candidates.reduce((a,b)=>a.x>b.x?a:b);
 return candidates.reduce((a,b)=>distance(a,m.player)<distance(b,m.player)?a:b);
}
function passBall(){
 const m=match;
 if(!m||m.done||m.flight)return;
 if(m.mode==='defend'){tackle(false);return}
 if(m.ballOwner!=='me'){setMatchHint('Önce topu kontrol et.');return}
 const mate=findPassReceiver();if(!mate){setMatchHint('Pas verecek arkadaş bulunamadı.');return}
 m.passes++;
 const distanceTo=distance(m.player,mate);
 m.ballOwner='flight';
 m.flight={kind:'pass',t:0,duration:clamp(distanceTo/15,.35,.9),
  sx:m.ball.x,sy:m.ball.y,sz:m.ball.z,tx:mate.x,ty:.23,tz:mate.z,
  arc:.7+distanceTo*.028,receiver:mate};
 setMatchHint('PAS GİDİYOR · Top takım arkadaşına doğru ilerliyor.');
}
function tackle(sliding){
 const m=match;if(!m||m.done||m.flight||m.mode!=='defend')return;
 if(m.defenseCooldown>0)return;
 const d=distance(m.player,m.carrier);
 m.defenseCooldown=sliding?1.35:.75;
 if(d>(sliding?3.7:2.6)){
  setMatchHint(sliding?'KAYARAK MÜDAHALE BOŞA GİTTİ · Rakibe yaklaş.':'TOPA UZAKSIN · Joystick ile rakibe yaklaş.');
  m.stamina=clamp(m.stamina-(sliding?15:4),0,100);return;
 }
 const odds=clamp((sliding?.77:.88) + (2.1-d)*.10-(sliding?.07:0),.24,.96);
 if(Math.random()<odds){
  m.defenderWins++;m.mode='counter';m.ballOwner='me';m.ball.x=m.player.x;m.ball.z=m.player.z+.8;
  m.team=[{x:-6,z:m.player.z+6,run:0},{x:6,z:m.player.z+7,run:0}];
  m.defenders=[{x:m.player.x-3,z:m.player.z+7,speed:3.4,run:0},{x:m.player.x+4,z:m.player.z+10,speed:3.0,run:0}];
  m.carrier=null;setMatchHint('TOPU KAPTIN! Şimdi kontra atak: PAS veya ŞUT!');matchButtons();
 }else{
  m.stamina=clamp(m.stamina-12,0,100);
  setMatchHint(sliding?'KAYARAK MÜDAHALE BAŞARISIZ · Rakip geçiyor!':'MÜDAHALE BAŞARISIZ · Tekrar yaklaş!');
 }
}
function shootBall(power){
 const m=match;
 if(!m||m.done||m.flight)return;
 if(m.mode==='defend'){tackle(true);return}
 if(m.ballOwner!=='me'){setMatchHint('Şut için topun ayağına gelmesi gerekiyor.');return}
 power=clamp(power,.14,1);
 m.shotCount++;
 const distanceToGoal=Math.max(5,52-m.player.z);
 const shotError=(100-(career.shoot||60))/35;
 const aimOffset=Math.abs(joy.x)>.15?joy.x*2.8:m.aim*2.8;
 const tx=clamp(m.player.x*.18+aimOffset+rnd(-shotError,shotError),-6.2,6.2);
 const ty=clamp(.45+power*1.35+rnd(-.20,.53),.25,3.2);
 const keeperRead=clamp(.42+(1-power)*.23 +(distanceToGoal-17)*.004,.2,.82);
 const blocked=m.defenders.some(d=>d.z>m.player.z && d.z<m.player.z+9 && Math.abs(d.x-m.player.x)<1.0)&&Math.random()<.28;
 const onTarget=Math.abs(tx)<3.5&&ty<2.44;
 const saved=onTarget&&!blocked&&Math.random()<keeperRead*(1-Math.min(.55,Math.abs(tx)/6));
 const post=Math.abs(Math.abs(tx)-3.55)<.13;
 const outcome=blocked?'blocked':post?'post':!onTarget?'miss':saved?'save':'goal';
 const targetZ=blocked?m.player.z+7:52.5;
 m.ballOwner='flight';m.flight={kind:'shot',t:0,duration:clamp(distanceToGoal/(19+power*20),.36,1.25),
  sx:m.ball.x,sy:m.ball.y,sz:m.ball.z,tx:blocked?m.player.x:tx,ty:blocked?.5:ty,tz:targetZ,
  arc:power*2.1+1.1,power,outcome};
 m.keeperAim=tx;
 m.charge=0;$('#power').style.width='0%';
 setMatchHint('ŞUT! · Top kaleye doğru gidiyor...');
}
function performShot(isPass=false){if(isPass)passBall();else shootBall(match?.charge||.50)}
function finishFlight(f){
 const m=match;if(!m)return;
 if(f.kind==='pass'){
  const d=m.defenders.find(p=>distance(p,{x:f.tx,z:f.tz})<1.45);
  if(d){m.flight=null;m.ballOwner='opponent';setMatchHint('PAS ARAYA GİTTİ! Rakip topu kazandı.');queueNextMoment();return}
  const prev={x:m.player.x,z:m.player.z,run:m.run};
  m.player={x:f.receiver.x,z:f.receiver.z};
  m.team=m.team.filter(p=>p!==f.receiver);m.team.push(prev);
  m.ball={x:m.player.x,y:.23,z:m.player.z+.8};m.ballOwner='me';
  m.flight=null;m.successfulPasses++;
  setMatchHint('PAS BAŞARILI! Artık topu alan futbolcuyu kontrol ediyorsun. Şut çekebilir ya da yeniden pas verebilirsin.');
  return;
 }
 m.flight=null;m.ballOwner='none';
 const outcome=f.outcome;
 if(outcome==='goal'){
  m.gf++;career.goals++;m.feedback='GOOOL!';setMatchHint('GOOOL! Köşeye giden top ağlarda!');
 }else if(outcome==='save'){
  m.feedback='KURTARIŞ';setMatchHint('KURTARIŞ! Kaleci uzandı ve şutu çıkardı.');
 }else if(outcome==='post'){
  m.feedback='DİREK';setMatchHint('DİREK! Top direkten döndü.');
 }else if(outcome==='blocked'){
  m.feedback='BLOK';setMatchHint('SAVUNMA BLOKLADI! Rakip ayağını uzattı.');
 }else{
  m.feedback='AUT';setMatchHint('AUT! Şut çerçeveyi bulamadı.');
 }
 $('#score').textContent=`${m.gf} — ${m.ga}`;
 queueNextMoment(1.65);
}
function endMatch(){if(!match)return;let gf=match.gf,ga=match.ga;if(Math.random()<.45)ga++;if(Math.random()<.25)gf++;let win=gf>ga,loss=gf<ga;career.week++;career.points+=win?3:loss?0:1;career.energy=clamp(career.energy-14,0,100);career.coach=clamp(career.coach+ (match.gf>0?5:loss?-2:1),0,100);career.matchHistory.push({gf,ga,week:career.week-1});save();switchTo('result');$('#r-week').textContent=career.week-1;$('#r-title').textContent=`${gf} - ${ga}`;$('#r-text').textContent=`${win?'GALİBİYET':loss?'MAĞLUBİYET':'BERABERLİK'} · ${career.name} ${match.shotCount} şut, ${match.successfulPasses} başarılı pas, ${match.defenderWins} top kapma. Hocanın güveni ${career.coach}/100.`;$('#r-stats').innerHTML=statsHTML([['TOPLAM GOL',career.goals],['ASİST',career.assists],['LİG PUANI',career.points]]);match=null}
$('#r-next').onclick=()=>{if(career.week%3===0&&career.week<12){storyPhase=2;showStory()}else showHub()};
/* Ekran yönü dünya X yönü ile birebir: parmak sol = x negatif.
   Pointer capture ve blur temizliği nedeniyle ekran dışında takılı kalmaz. */
const joyEl=$('#joy'),thumb=$('#thumb');let pressed=false, activePointer=null,keys={};
function updateJoy(e){
  const r=joyEl.getBoundingClientRect();
  let x=(e.clientX-r.left-r.width/2)/(r.width*.36);
  let y=(e.clientY-r.top-r.height/2)/(r.height*.36);
  const len=Math.hypot(x,y);if(len<.13){x=0;y=0}else if(len>1){x/=len;y/=len}
  joy.x=clamp(x,-1,1);joy.y=clamp(y,-1,1);
  thumb.style.transform=`translate(${joy.x*r.width*.26}px,${joy.y*r.height*.26}px)`;
}
joyEl.addEventListener('pointerdown',e=>{
 if(pressed)return;e.preventDefault();activePointer=e.pointerId;pressed=true;
 joyEl.setPointerCapture(e.pointerId);updateJoy(e)
});
joyEl.addEventListener('pointermove',e=>{if(pressed&&activePointer===e.pointerId){e.preventDefault();updateJoy(e)}});
function joyOff(e){
 if(e&&e.pointerId!=null&&activePointer!==e.pointerId)return;
 pressed=false;activePointer=null;joy.x=joy.y=0;thumb.style.transform='translate(0,0)';
}
joyEl.addEventListener('pointerup',joyOff);joyEl.addEventListener('pointercancel',joyOff);
window.addEventListener('blur',()=>joyOff());
document.addEventListener('visibilitychange',()=>{if(document.hidden){joyOff();shotStart=0;keys={}}});
let shootEl=$('#shoot');
shootEl.addEventListener('pointerdown',e=>{
  if(!match||match.done||match.flight)return;
  e.preventDefault();shootEl.setPointerCapture(e.pointerId);shotStart=performance.now();
});
shootEl.addEventListener('pointerup',e=>{
 e.preventDefault();if(!match||!shotStart)return;
 const charge=clamp((performance.now()-shotStart)/1150,.15,1);shotStart=0;
 if(match.mode==='defend')tackle(true);else shootBall(charge);
});
shootEl.addEventListener('pointercancel',()=>{shotStart=0;$('#power').style.width='0%'});
shootEl.onclick=e=>{if(e.detail===0&&match){if(match.mode==='defend')tackle(true);else shootBall(.65)}};
$('#pass').addEventListener('pointerdown',e=>{e.preventDefault();passBall()});
$('#pass').onclick=e=>{if(e.detail===0)passBall()};
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 if(keys[k])return;keys[k]=true;
 if(k===' '&&match){if(match.mode==='defend')tackle(true);else shootBall(.68)}
 if(k==='p'&&match)passBall();
});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
// ── WebGL helper / mesh builder ──
const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const mul=(a,b)=>{let r=new Array(16).fill(0);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)r[i+j*4]+=a[i+k*4]*b[k+j*4];return r};
const tr=(x,y,z)=>{let m=I();m[12]=x;m[13]=y;m[14]=z;return m};const sc=(x,y,z)=>{let m=I();m[0]=x;m[5]=y;m[10]=z;return m};const ry=a=>{let m=I();m[0]=Math.cos(a);m[2]=-Math.sin(a);m[8]=Math.sin(a);m[10]=Math.cos(a);return m};const rz=a=>{let m=I();m[0]=Math.cos(a);m[1]=Math.sin(a);m[4]=-Math.sin(a);m[5]=Math.cos(a);return m};
const sub=(a,b)=>a.map((x,i)=>x-b[i]),norm=v=>{let l=Math.hypot(...v)||1;return v.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((t,x,i)=>t+x*b[i],0);
const look=(eye,target)=>{let z=norm(sub(eye,target)),x=norm(cross(z,[0,1,0])),y=cross(x,z);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]};
const persp=(fov,aspect,n,f)=>{let s=1/Math.tan(fov/2);return [s/aspect,0,0,0,0,s,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]};
let renderOK=!!gl,shader=null,geo={},u={},canvasW=0,canvasH=0,activeView=I();
function hex(s){s=typeof s==='string'?s:'#ffffff';return [parseInt(s.slice(1,3),16)/255,parseInt(s.slice(3,5),16)/255,parseInt(s.slice(5,7),16)/255]}
function makeGeo(v){let out=[],positions=v.vertices,normals=v.normals;for(let i=0;i<positions.length;i+=3)out.push(...positions.slice(i,i+3),...normals.slice(i,i+3));let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(out),gl.STATIC_DRAW);return {buffer:b,count:out.length/6}}
function cubeGeo(){let p=[],n=[],faces=[[[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[[1,0,0],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,0,0],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[[0,1,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[0,-1,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]];for(let f of faces){for(let idx of [1,2,3,1,3,4]){p.push(...f[idx]);n.push(...f[0])}}return {vertices:p,normals:n}}
function sphereGeo(){let p=[],n=[],rows=12,cols=16;function v(th,ph){let a=Math.sin(th)*Math.cos(ph),b=Math.cos(th),cc=Math.sin(th)*Math.sin(ph);return [a,b,cc]}for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){let a=v(i*Math.PI/rows,j*Math.PI*2/cols),b=v((i+1)*Math.PI/rows,j*Math.PI*2/cols),cc=v((i+1)*Math.PI/rows,(j+1)*Math.PI*2/cols),d=v(i*Math.PI/rows,(j+1)*Math.PI*2/cols);for(let q of [a,b,cc,a,cc,d]){p.push(...q);n.push(...q)}}return {vertices:p,normals:n}}
if(gl){try{let vs=`attribute vec3 p;attribute vec3 n;uniform mat4 vp,m;varying vec3 nv;varying float dist;void main(){vec4 w=m*vec4(p,1.);gl_Position=vp*w;nv=mat3(m)*n;dist=length(w.xyz);}`,fs=`precision mediump float;varying vec3 nv;varying float dist;uniform vec3 color;void main(){float lite=max(dot(normalize(nv),normalize(vec3(-.6,1.0,.45))),0.0)*.58+.44;vec3 col=color*lite;float fog=clamp((dist-55.)/150.,0.,.58);gl_FragColor=vec4(mix(col,vec3(.052,.079,.12),fog),1.);}`;function compile(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}shader=gl.createProgram();gl.attachShader(shader,compile(gl.VERTEX_SHADER,vs));gl.attachShader(shader,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(shader);if(!gl.getProgramParameter(shader,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(shader));gl.useProgram(shader);u={p:gl.getAttribLocation(shader,'p'),n:gl.getAttribLocation(shader,'n'),vp:gl.getUniformLocation(shader,'vp'),m:gl.getUniformLocation(shader,'m'),color:gl.getUniformLocation(shader,'color')};geo.box=makeGeo(cubeGeo());geo.ball=makeGeo(sphereGeo());gl.enable(gl.DEPTH_TEST);gl.clearColor(.028,.053,.074,1)}catch(e){renderOK=false;console.error('WebGL engine failed',e)}}
function model(kind,x,y,z,w,h,d,color,angle=0,tilt=0){let g=geo[kind];if(!g)return;gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.enableVertexAttribArray(u.p);gl.vertexAttribPointer(u.p,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(u.n);gl.vertexAttribPointer(u.n,3,gl.FLOAT,false,24,12);let m=mul(mul(mul(tr(x,y,z),ry(angle)),rz(tilt)),sc(w/2,h/2,d/2));gl.uniformMatrix4fv(u.m,false,new Float32Array(m));gl.uniform3fv(u.color,new Float32Array(hex(color)));gl.drawArrays(gl.TRIANGLES,0,g.count)}
const bx=(x,y,z,w,h,d,color,a=0)=>model('box',x,y,z,w,h,d,color,a),orb=(x,y,z,w,h,d,color)=>model('ball',x,y,z,w,h,d,color);
function footballer(x,z,skin,hair,shirt,shorts,anim=0,scale=1,angle=0,style='kisa'){let run=Math.sin(anim)*.1*scale,yy=0;bx(x,yy+.55*scale,z,.34*scale,.48*scale,.24*scale,shorts,angle);model('ball',x-.13*scale,yy+.27*scale,z+run,.15*scale,.58*scale,.15*scale,skin,angle,run);model('ball',x+.13*scale,yy+.27*scale,z-run,.15*scale,.58*scale,.15*scale,skin,angle,-run);bx(x-.13*scale,yy+.065*scale,z+run,.24*scale,.12*scale,.34*scale,'#111926',angle);bx(x+.13*scale,yy+.065*scale,z-run,.24*scale,.12*scale,.34*scale,'#111926',angle);bx(x,yy+1.12*scale,z,.64*scale,.79*scale,.36*scale,shirt,angle);model('ball',x-.43*scale,yy+.95*scale,z+run*.6,.17*scale,.66*scale,.18*scale,skin,angle,run);model('ball',x+.43*scale,yy+.95*scale,z-run*.6,.17*scale,.66*scale,.18*scale,skin,angle,-run);orb(x,yy+1.74*scale,z,.43*scale,.52*scale,.43*scale,skin);if(style!=='kazit')orb(x,yy+(style==='afro'?1.96:1.99)*scale,z,(style==='afro'?.52:.44)*scale,(style==='uzun'?.37:.22)*scale,(style==='afro'?.52:.46)*scale,hair);for(let side of [-1,1])orb(x+side*.115*scale,yy+1.76*scale,z+.198*scale,.048*scale,.054*scale,.03*scale,'#172331')}
function pitch(t){bx(0,-.24,0,78,.45,114,'#0c3426');for(let i=0;i<18;i++){let z=-49.5+i*5.8;bx(0,-.008,z,68,.023,5.8,i%2?'#20794a':'#1b6b43')}let L='#e9f1e8';for(let x of [-34,34])bx(x,.018,0,.12,.025,105,L);for(let z of [-52.5,52.5])bx(0,.018,z,68,.025,.12,L);bx(0,.018,0,68,.025,.12,L);for(let z of [-52.5,52.5]){let d=z>0?-1:1;bx(0,.018,z+d*16.5,40.32,.025,.12,L);for(let x of [-20.16,20.16])bx(x,.018,z+d*8.25,.12,.025,16.5,L);bx(0,.018,z+d*5.5,18.32,.025,.12,L);for(let x of [-9.16,9.16])bx(x,.018,z+d*2.75,.12,.025,5.5,L);for(let i=0;i<36;i++){let a=i*2*Math.PI/36,b=(i+1)*2*Math.PI/36;let x=Math.cos(a)*9.15,y=Math.sin(a)*9.15,xx=Math.cos(b)*9.15,yy=Math.sin(b)*9.15;bx((x+xx)/2,.021,(y+yy)/2,Math.hypot(xx-x,yy-y),.022,.1,L,-Math.atan2(yy-y,xx-x))}}for(let z of [-52.5,52.5]){let d=z>0?1:-1;for(let x of [-3.66,3.66]){bx(x,1.22,z,.13,2.44,.13,'#f1f1e6');bx(x,1.21,z+d*2,.075,2.4,.075,'#92a49e')}bx(0,2.44,z,7.4,.12,.13,'#f6faf5');bx(0,2.43,z+d*2,7.4,.08,.06,'#b0bfb8');for(let i=0;i<8;i++)bx(-3.5+i,1.2,z+d*2,.022,2.4,.022,'#a9beb8')}
for(let k=0;k<4;k++){let side=k%2?-1:1,z=k<2?-39:39;bx(side*46,10,z,.65,20,.65,'#45585c');bx(side*46,20,z,4,.55,2.4,'#ffecb3')}for(let s of [-1,1]){for(let tier=0;tier<4;tier++)bx(s*(41+tier*5),1.3+tier*2.8,0,7,3,124,tier%2?'#203c43':'#192d37');for(let i=0;i<100;i++){let x=s*(41+(i%4)*4.4),z=((i*17)%103)-51.5;bx(x,3.2+Math.floor(i%4)*2.8,z,.55,.7,.55,['#f0c77f','#c3d6df','#d7786e','#7ecda8'][i%4])}}for(let z of [-57,57]){for(let tier=0;tier<2;tier++)bx(0,1.5+tier*3,z+(z>0?1:-1)*tier*5,90,3,7,'#233842')}for(let s of [-1,1])bx(s*34.5,.15,0,.35,.3,100,'#e1b85f')}
function office(t){bx(0,-.15,0,17,.28,16,'#544636');bx(0,5,-8,17,10,.3,'#27394a');bx(-8,5,0,.3,10,16,'#1c2937');bx(8,5,0,.3,10,16,'#172a3c');bx(0,5,8,17,10,.3,'#15232f');for(let x of [-4,0,4]){bx(x,5,-7.81,2.2,3.4,.09,'#2b607a');bx(x,5,-7.76,1.7,2.9,.09,career?.country==='tr'?'#5193a0':career?.country==='en'?'#4a6c89':'#c39c6a')}bx(0,1.25,-1,6,.24,2.5,'#4a352b');for(let x of [-2.5,2.5])bx(x,.65,-1,.3,1.25,1.7,'#59453b');bx(0,1.55,-1,.7,.25,.55,'#2e333c');bx(0,1.67,-1,.66,.05,.46,'#aaaeb4');bx(0,0,-5,5,.22,1.9,'#2c3540');footballer(-2,-3,'#ca9470','#26202a','#323b49','#161b29',t*.6,.95,.18,'kisa');footballer(2,-2,career?.skin||draft.skin,career?.hair||draft.hair,career?.kit||draft.kit,'#eef1e9',t*.6,.98,-.18,career?.hairStyle||draft.hairStyle);for(let x of [-4,4]){bx(x,.2,3,1.5,.3,1.3,'#243342');bx(x,.8,3.8,1.5,1.1,.26,'#28394a')}bx(0,3.4,-7.6,3.9,1.35,.18,'#dbb55b');bx(0,3.4,-7.5,3.35,1.02,.2,'#223c43')}
function displayStage(t){bx(0,-.2,0,11,.35,11,'#17252e');bx(0,.05,0,4,.28,4,'#7a6450');bx(0,-.06,0,4.9,.09,4.9,'#f0c975');for(let x of [-5,5])bx(x,3,-2,.15,6,.15,'#7e8da0');footballer(0,0,draft.skin,draft.hair,draft.kit,'#172a40',Math.sin(t)*.3,1.45,Math.sin(t*.45)*.35,draft.hairStyle)}
function resize(){let w=innerWidth,h=innerHeight,dp=Math.min(devicePixelRatio||1,1.6);if(c.width!==Math.round(w*dp)||c.height!==Math.round(h*dp)){c.width=Math.round(w*dp);c.height=Math.round(h*dp)}gl.viewport(0,0,c.width,c.height);canvasW=w;canvasH=h}
function render(ts){requestAnimationFrame(render);if(!renderOK)return;resize();let t=ts*.001,eye,target,fov=55;if(screen==='create'){eye=[Math.sin(t*.3)*5,2.9,7];target=[0,1.4,0];fov=48}else if(screen==='story'){eye=[0,3.35,9.4];target=[0,1.45,-2.6];fov=54}else if(screen==='hub'){eye=[10,14,-35];target=[0,1,12];fov=54}else if(screen==='match'&&match){let p=match.player;eye=[p.x,4.7,p.z-12.3];target=[p.x,1.1,p.z+20];fov=56}else{eye=[10,7,-2];target=[0,.5,34];fov=57}let vp=mul(persp(fov*Math.PI/180,c.width/c.height,.1,250),look(eye,target));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(u.vp,false,new Float32Array(vp));if(screen==='story')office(t);else if(screen==='create')displayStage(t);else{pitch(t);if(screen==='title'){footballer(-2,19,'#cc926a','#21242a','#e0b84f','#f0efe2',t*1.3,1,0);footballer(6,31,'#8d6549','#222028','#ae3348','#f6f6ee',t*.9,1,Math.PI);orb(-1,.23,22,.45,.45,.45,'#f5f5df')}else if(screen==='match'&&match){let p=match.player;footballer(p.x,p.z,career.skin,career.hair,career.kit||leagues[career.country].clubs[career.club][1],'#ecebdc',match.run,1,0,career.hairStyle);footballer(match.keeper.x,49,'#aa805d','#191d21','#c0e97c','#192a36',t*1.5,1,Math.PI);for(let d of match.defenders)footballer(d.x,d.z,'#c29274','#292831','#ae4a5e','#f0f0ed',d.run||t,1,Math.PI);if(match.carrier)footballer(match.carrier.x,match.carrier.z,'#bc8965','#292831','#ae4a5e','#f0f0ed',match.run,1,Math.PI);for(let p of match.team)footballer(p.x,p.z,'#bf8d6c','#333039',career.kit||leagues[career.country].clubs[career.club][1],'#f3eee5',p.run||t,1,0);orb(match.ball.x,match.ball.y,match.ball.z,.44,.44,.44,'#f5f0e6');if(!match.done&&match.mode!=='defend'){let ax=clamp(match.player.x*.18+match.aim*2.8,-3.4,3.4);bx(ax,1.3,51.9,.24,.24,.1,'#f3d27a');bx(ax,1.3,51.9,.7,.04,.1,'#f6e6a5');bx(ax,1.3,51.9,.04,.7,.1,'#f6e6a5')}}else if(screen==='hub'||screen==='result'){footballer(-3,32,career?.skin||draft.skin,career?.hair||draft.hair,career?.kit||draft.kit,'#eaeaea',t*.4,1,0,career?.hairStyle||draft.hairStyle);footballer(4,40,'#bb9269','#24262b','#ad3f51','#eeeeee',t*.3,1,Math.PI)}}}
if(!renderOK){toast('3D grafik kapalı: 2D yedek görünüm aktif.');requestAnimationFrame(renderFallback)}else requestAnimationFrame(render);
function renderFallback(time){requestAnimationFrame(renderFallback);if(renderOK)return;let g=c.getContext('2d');if(!g)return;let w=innerWidth,h=innerHeight,dp=Math.min(devicePixelRatio||1,1.6);if(c.width!==Math.round(w*dp)||c.height!==Math.round(h*dp)){c.width=Math.round(w*dp);c.height=Math.round(h*dp)}g.setTransform(dp,0,0,dp,0,0);let sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#091b2a');sky.addColorStop(.5,'#153b42');sky.addColorStop(1,'#0d1f2c');g.fillStyle=sky;g.fillRect(0,0,w,h);const poly=(pts,color)=>{g.fillStyle=color;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()};
if(screen==='create'){let cx=w*.66,cy=h*.48;g.fillStyle='#b9965880';g.beginPath();g.ellipse(cx,cy+148,90,22,0,0,Math.PI*2);g.fill();g.fillStyle='#d7bf88';g.fillRect(cx-40,cy+112,80,24);drawAvatar(g,cx,cy,draft.skin,draft.hair,'#ebd98b',1.65);return}
if(screen==='story'){poly([[0,h*.38],[w,h*.38],[w,h],[0,h]],'#3b3534');poly([[0,0],[w,0],[w,h*.38],[0,h*.38]],'#263c4b');g.fillStyle='#4c8b97';g.fillRect(w*.3,h*.16,w*.4,h*.21);g.fillStyle='#293a48';g.fillRect(w*.32,h*.18,w*.36,h*.18);g.fillStyle='#74543c';g.fillRect(w*.19,h*.46,w*.64,h*.07);g.fillStyle='#4e392e';g.fillRect(w*.24,h*.51,w*.05,h*.16);g.fillRect(w*.72,h*.51,w*.05,h*.16);drawAvatar(g,w*.28,h*.38,'#b38768','#282026','#263c52',1.05);drawAvatar(g,w*.72,h*.44,career?.skin||draft.skin,career?.hair||draft.hair,'#dbc27c',1.08);return}
let horizon=h*.32;poly([[0,horizon],[w,horizon],[w,h*.56],[0,h*.56]],'#253a42');for(let i=0;i<170;i++){g.fillStyle=['#90a6a6','#e0c677','#91cebe','#be7478'][i%4];g.globalAlpha=.18;g.fillRect((i*43)%w,horizon+((i*17)%50),2,2)}g.globalAlpha=1;poly([[w*.27,h*.45],[w*.73,h*.45],[w*1.15,h],[w*-.15,h]],'#1a6c48');for(let i=0;i<12;i++){let y=h*.45+(h*.55)*i/12,yy=h*.45+(h*.55)*(i+1)/12,ratio=i/12,ratio2=(i+1)/12;poly([[w*(.27-.45*ratio),y],[w*(.73+.45*ratio),y],[w*(.73+.45*ratio2),yy],[w*(.27-.45*ratio2),yy]],i%2?'#257d4b':'#237749')}
g.strokeStyle='#eaf5e8';g.lineWidth=2;g.beginPath();g.moveTo(w*.27,h*.45);g.lineTo(w*-.15,h);g.moveTo(w*.73,h*.45);g.lineTo(w*1.15,h);g.moveTo(w*.27,h*.45);g.lineTo(w*.73,h*.45);g.stroke();g.strokeStyle='#ebf7ef';g.lineWidth=5;g.strokeRect(w*.4,h*.385,w*.2,h*.095);g.lineWidth=1.2;g.strokeRect(w*.4,h*.49,w*.2,h*.07);let ox=w*.5;
if(screen==='title'){drawAvatar(g,ox+w*.09,h*.57,'#d6a16c','#26262a','#efc762',1.6);drawAvatar(g,ox-w*.13,h*.45,'#d6a16c','#202126','#bd4750',.65)}else if(screen==='match'&&match){
 const m=match, p=m.player;
 // 2D yedek kipte de hareketli yapay zekâ ve gerçek pas/top uçuşu çizilir.
 const point=(x,z,y=0)=>{
  const dist=clamp(z-p.z,0,48);
  const depth=clamp(1-dist/64,.25,1);
  return {x:w*.5+(x-p.x)*w*.022*depth,
          y:h*.69-dist*h*.0077-y*h*.038,
          scale:depth};
 };
 const actors=[];
 for(const d of m.defenders)actors.push({x:d.x,z:d.z,skin:'#c98b6c',hair:'#23242b',shirt:'#a94e5e'});
 for(const a of m.team)actors.push({x:a.x,z:a.z,skin:'#c69a77',hair:'#23242b',shirt:career.kit||'#efc762'});
 if(m.carrier)actors.push({x:m.carrier.x,z:m.carrier.z,skin:'#b8896d',hair:'#23242b',shirt:'#a94e5e'});
 actors.push({x:m.keeper.x,z:49,skin:'#c58a6e',hair:'#23242b',shirt:'#92caaf'});
 actors.sort((a,b)=>b.z-a.z);
 for(const a of actors){const q=point(a.x,a.z);drawAvatar(g,q.x,q.y,a.skin,a.hair,a.shirt,.58*q.scale)}
 const me=point(p.x,p.z);drawAvatar(g,me.x,me.y,career.skin,career.hair,career.kit||'#eac363',.90);
 const ball=point(m.ball.x,m.ball.z,m.ball.y);g.beginPath();g.arc(ball.x,ball.y+14*ball.scale,Math.max(3,6*ball.scale),0,Math.PI*2);
 g.fillStyle='#f0f6ed';g.fill();g.strokeStyle='#1f3c3a';g.lineWidth=1.5;g.stroke();
 if(m.flight){const f=point(m.flight.tx,m.flight.tz,m.flight.ty||0);
  g.setLineDash([5,6]);g.strokeStyle='#c2f858';g.lineWidth=2;g.beginPath();g.moveTo(ball.x,ball.y);g.lineTo(f.x,f.y);g.stroke();g.setLineDash([])}
 }
else{drawAvatar(g,ox,h*.59,career?.skin||draft.skin,career?.hair||draft.hair,'#eac363',1.35)}
function drawAvatar(ctx,x,y,skin,hair,shirt,scale){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,94,26,8,0,0,7);ctx.fill();ctx.strokeStyle='#dad7d0';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-11,30);ctx.lineTo(-14,88);ctx.moveTo(11,30);ctx.lineTo(14,88);ctx.stroke();ctx.fillStyle=shirt;ctx.beginPath();ctx.moveTo(-28,-45);ctx.lineTo(28,-45);ctx.lineTo(22,32);ctx.lineTo(-22,32);ctx.closePath();ctx.fill();ctx.strokeStyle=skin;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-27,-36);ctx.lineTo(-38,12);ctx.moveTo(27,-36);ctx.lineTo(38,12);ctx.stroke();ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,-64,19,23,0,0,7);ctx.fill();ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(0,-79,20,11,0,Math.PI,Math.PI*2);ctx.fill();ctx.restore()}}

/* Saniye cinsinden fizik güncellemesi: 30 / 60 / 120 Hz davranışı aynı. */
function advanceFlight(dt){
 if(!match||!match.flight||screen!=='match')return;
 const f=match.flight;
 f.t=Math.min(1,f.t+Math.max(0,dt)/f.duration);
 const t=f.t;
 match.ball={x:f.sx+(f.tx-f.sx)*t,
  y:f.sy+(f.ty-f.sy)*t+Math.sin(Math.PI*t)*f.arc,
  z:f.sz+(f.tz-f.sz)*t};
 if(t>=1)finishFlight(f);
}
function updatePlayers(dt){
 const m=match;if(!m||m.done)return;
 m.clock+=dt;m.defenseCooldown=Math.max(0,m.defenseCooldown-dt);
 if(m.flight){
  m.keeper.x+=((m.keeperAim||0)-m.keeper.x)*Math.min(1,dt*2.8);
  return;
 }
 const dx=joy.x+(keys['d']||keys['arrowright']?1:0)-(keys['a']||keys['arrowleft']?1:0);
 const dy=-joy.y+(keys['w']||keys['arrowup']?1:0)-(keys['s']||keys['arrowdown']?1:0);
 const length=Math.hypot(dx,dy),scale=length>1?1/length:1;
 const sprint=length>.82&&m.stamina>5;
 const speed=sprint?7.1:4.7;
 m.player.x=clamp(m.player.x+dx*scale*dt*speed,-29,29);
 m.player.z=clamp(m.player.z+dy*scale*dt*speed, m.mode==='defend'?5:10,46);
 m.run+=length*dt*12;
 m.stamina=clamp(m.stamina+(sprint?-18:9)*dt,0,100);
 m.aim=clamp(joy.x||dx*scale,-1,1);
 if(m.mode==='defend'&&m.carrier){
  const carrier=m.carrier;
  carrier.z-=carrier.speed*dt;
  carrier.x=clamp(carrier.x+Math.sin(m.clock*2)*dt*.75,-8,8);
  m.ball={x:carrier.x,y:.23,z:carrier.z+.45};
  // Top kapma kullanıcı müdahalesi gerektirir; otomatik müdahale yapma.
  if(m.clock>=13||carrier.z<13){
   const conceded=Math.random()<.66;
   if(conceded){m.ga++;$('#score').textContent=`${m.gf} — ${m.ga}`;
    setMatchHint('RAKİP GOL ATTI · Savunmada müdahale zamanlaması önemli.');}
   else setMatchHint('RAKİP KAÇIRDI · Savunmada pozisyonu korudun.');
   queueNextMoment(1.45);
  }
  for(const p of m.defenders){p.z-=dt*2.0;p.run+=dt*7;}
  return;
 }
 m.ball={x:m.player.x,y:.23,z:m.player.z+.72};
 for(let i=0;i<m.team.length;i++){
  let teammate=m.team[i];
  const desired={x:i%2===0?-6.5:6.5,z:clamp(m.player.z+8+(i%2)*2,13,44)};
  moveTowards(teammate,desired,5.3,dt);teammate.run+=dt*7;
 }
 for(const d of m.defenders){
  if(m.mode==='freekick'&&m.clock<1.8)continue;
  const desired={x:m.player.x,z:Math.min(46,m.player.z+1.1)};
  moveTowards(d,desired,d.speed,dt);d.run+=dt*7;
  if(distance(d,m.player)<1.12&&m.mode!=='freekick'){
   if(m.defenseCooldown===0){
    m.defenseCooldown=1.9;
    if(Math.random()<.42){setMatchHint('RAKİP TOPU KAPTI! Pozisyon sona erdi.');queueNextMoment(1.15)}
    else{m.stamina=Math.max(0,m.stamina-6);setMatchHint('BASKI ALTINDASIN! Pas ver veya şut çek.');}
   }
  }
 }
}
let last=performance.now();
function logic(ts){
 const dt=Math.min(.05,Math.max(0,(ts-last)/1000));last=ts;
 if(screen==='match'&&match){
  if(match.nextDelay>0){match.nextDelay-=dt;if(match.nextDelay<=0){match.moment++;nextMoment()}}
  else if(!match.done){
   if(match.flight)advanceFlight(dt);else updatePlayers(dt);
  }
  if(shotStart)$('#power').style.width=Math.round(clamp((ts-shotStart)/1150,0,1)*100)+'%';
  const stamina=$('#stamina');if(stamina&&match)stamina.style.width=Math.round(match.stamina)+'%';
 }
 requestAnimationFrame(logic);
}
requestAnimationFrame(logic);
try{let rec=localStorage.getItem(key);if(rec){let v=JSON.parse(rec);if(v&&v.name&&leagues[v.country]){career=v;career.kit=career.kit||leagues[career.country].clubs[career.club][1];$('#resume').hidden=false}}}catch(e){}switchTo('title');
