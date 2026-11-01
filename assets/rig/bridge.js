/* Yıldız Yolu v0.8 — opt-in rigged GLB match renderer (Three.js r147, MIT).
 * Original authored footballer from user-supplied Claude package. No external CDN.
 * A single scene/canvas contains field, goal, ball, and all animated footballers.
 * Legacy WebGL stays as the manual fallback and retains all gameplay state. */
(function(){
 'use strict';
 // The modern dual-GLB mode owns the only WebGL context; do not register a second renderer.
 if(new URLSearchParams(location.search).get('rig3d')==='1')return;
 const root=new URL('./',document.currentScript.src).href;
 const oldCanvas=document.getElementById('world'), matchScreen=document.getElementById('s-match');
 if(!oldCanvas||!matchScreen)return;
 const toggle=document.createElement('button');
 toggle.id='rig-toggle';toggle.type='button';toggle.className='back-pass';
 toggle.textContent='3D MODEL: AÇ';toggle.title='İskelet animasyonlu futbolcular — deneysel mod';
 toggle.style.cssText='min-width:100px;max-width:150px;min-height:32px;font-size:10px;line-height:1.15';
 const controls=matchScreen.querySelector('.actions')||matchScreen;
 controls.append(toggle);
 const canvas=document.createElement('canvas');canvas.id='rig-world';
 canvas.setAttribute('aria-label','İskelet animasyonlu üç boyutlu maç sahnesi');
 canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;display:none;pointer-events:none;z-index:0';
 oldCanvas.parentElement.insertBefore(canvas,oldCanvas.nextSibling);
 let ready=false,active=false,busy=false,engine=null,fault=null,loadPromise=null,lastFrame=0;
 let fpsCount=0,fpsSince=0,frameRate=0,lastFlight=null;
 const actorIDs=new WeakMap();let idSeq=0;
 const actors=new Map();
 const appearance={};
 function script(url){return new Promise((resolve,reject)=>{
  const t=document.createElement('script');t.src=url;t.async=false;
  t.onload=resolve;t.onerror=()=>reject(new Error('Yüklenemedi: '+url));document.head.append(t);
 })}
 async function setup(){
  if(ready)return;
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
   if(!window.THREE)await script(root+'lib/three.min.js');
   if(!window.THREE.GLTFLoader)await script(root+'lib/GLTFLoader.js');
   if(!window.THREE.SkeletonUtils)await script(root+'lib/SkeletonUtils.js');
   const T=window.THREE;
   const renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:'high-performance'});
   renderer.setClearColor(0x071521,1);renderer.outputEncoding=T.sRGBEncoding;
   renderer.setPixelRatio(Math.min(1.25,window.devicePixelRatio||1));
   const scene=new T.Scene();scene.background=new T.Color(0x071521);scene.fog=new T.Fog(0x071521,52,144);
   const camera=new T.PerspectiveCamera(55,1,.1,220);
   scene.add(new T.HemisphereLight(0xcfeeff,0x1b3624,1.3));
   const sun=new T.DirectionalLight(0xffe8ba,1.32);sun.position.set(-24,44,-18);scene.add(sun);
   const fill=new T.DirectionalLight(0x8cb8ff,.60);fill.position.set(22,18,25);scene.add(fill);
   const mats={};
   const material=(col)=>mats[col]||(mats[col]=new T.MeshLambertMaterial({color:col}));
   const block=(x,y,z,w,h,d,col,parent=scene)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(col));m.position.set(x,y,z);parent.add(m);return m};
   function plane(){
    block(0,-.22,0,80,.45,118,'#0a3126');
    for(let i=0;i<18;i++)block(0,-.012,-49.5+i*5.8,68,.028,5.8,i%2?'#237748':'#1a693e');
    const l='#e6f1e9';
    for(const x of [-34,34])block(x,.018,0,.10,.026,105,l);
    for(const z of [-52.5,52.5])block(0,.019,z,68,.026,.1,l);
    block(0,.019,0,68,.025,.10,l);
    for(const side of [-1,1]){
     const z=side*52.5,shift=-side;
     block(0,.021,z+shift*16.5,40.32,.028,.10,l);
     for(const x of [-20.16,20.16])block(x,.021,z+shift*8.25,.10,.028,16.5,l);
     block(0,.021,z+shift*5.5,18.32,.028,.10,l);
     for(const x of [-9.16,9.16])block(x,.022,z+shift*2.75,.10,.028,5.5,l);
     for(const x of [-3.66,3.66])block(x,1.22,z,.13,2.44,.13,'#eeeeea');
     block(0,2.44,z,7.4,.12,.13,'#f9f8f0');
     const back=z+side*2.0;
     for(let a=0;a<8;a++)block(-3.5+a,1.15,back,.018,2.3,.018,'#bacbc7');
     block(0,2.43,back,7.4,.035,.035,'#bbcac1');
    }
    const ring=new T.Mesh(new T.RingGeometry(9.12,9.20,72),material(l));ring.rotation.x=-Math.PI/2;ring.position.y=.027;scene.add(ring);
    for(const side of [-1,1]){
     for(let tier=0;tier<3;tier++)block(side*(40+tier*6),1.3+tier*3,0,7,3,118,tier%2?'#18313e':'#273d48');
     for(let i=0;i<14;i++)block(side*34.6,.51,-48+i*7.4,.16,.7,7,'#d5c369');
    }
    for(const side of [-1,1])block(0,2.0,side*60,93,4,5,'#233948');
    for(const x of [-46,46])for(const z of [-40,40]){
     block(x,12,z,.55,24,.55,'#5c7182');block(x,24,z,4,.5,2,'#fff3c8');
    }
   }
   plane();
   const ball=new T.Mesh(new T.SphereGeometry(.21,12,9),new T.MeshStandardMaterial({color:'#f0efe8',roughness:.48}));scene.add(ball);
   const selection=new T.Mesh(new T.RingGeometry(.59,.72,36),new T.MeshBasicMaterial({color:0xbdf14e,side:T.DoubleSide}));selection.rotation.x=-Math.PI/2;selection.position.y=.045;scene.add(selection);
   const passRing=new T.Mesh(new T.RingGeometry(.5,.6,28),new T.MeshBasicMaterial({color:0x51c7fa,side:T.DoubleSide}));passRing.rotation.x=-Math.PI/2;passRing.position.y=.04;scene.add(passRing);
   const model=await new T.GLTFLoader().loadAsync(root+'footballer.glb');
   if(!model.animations.some(a=>a.name==='run'))throw Error('GLB koşu animasyonu yok.');
   engine={T,renderer,scene,camera,ball,selection,passRing,model};
   ready=true;
  })();
  try{await loadPromise}catch(e){loadPromise=null;if(engine){engine.renderer.dispose();engine=null}throw e}
 }
 function actorId(obj){if(!obj||typeof obj!=='object')return null;if(!actorIDs.has(obj))actorIDs.set(obj,'p'+(++idSeq));return actorIDs.get(obj)}
 function makeActor(id,category,colors){
  const T=engine.T,m=engine.model;
  const view=T.SkeletonUtils.clone(m.scene);
  view.traverse(n=>{
   if(!(n.isMesh||n.isSkinnedMesh))return;
   n.frustumCulled=false;
   const src=Array.isArray(n.material)?n.material:[n.material];
   const cloned=src.map(m=>{const next=m.clone();const k=String(next.name||'').toLowerCase();
    if(colors[k])next.color.set(colors[k]);return next});
   n.material=Array.isArray(n.material)?cloned:cloned[0];
  });
  const mix=new T.AnimationMixer(view), clips={};
  for(const clip of m.animations)clips[clip.name]=mix.clipAction(clip);
  const actor={id,view,mix,clips,kind:category,mode:'',oneShot:0,oldx:NaN,oldz:NaN,active:true,heading:category==='defender'||category==='keeper'?Math.PI:0};
  engine.scene.add(view);actors.set(id,actor);setClip(actor,'idle',true);
  return actor;
 }
 function setClip(a,mode,force=false){
  if(!force&&a.mode===mode)return;
  const next=a.clips[mode]||a.clips.idle;if(!next)return;
  if(mode.startsWith('pass')||mode.startsWith('shoot')){
   next.reset();next.setLoop(engine.T.LoopOnce,1);next.clampWhenFinished=false;
   a.oneShot=mode.startsWith('pass')?1.05:1.15;
  }else {next.setLoop(engine.T.LoopRepeat,Infinity);next.clampWhenFinished=false}
  next.enabled=true;next.fadeIn(.14).play();
  if(a.mode&&a.clips[a.mode]&&a.clips[a.mode]!==next)a.clips[a.mode].fadeOut(.14);
  a.mode=mode;
 }
 function dropActor(id){
  const a=actors.get(id);if(!a)return;
  a.mix.stopAllAction();
  a.view.traverse(n=>{if(n.isMesh||n.isSkinnedMesh){const mats=Array.isArray(n.material)?n.material:[n.material];mats.forEach(m=>m.dispose())}});
  engine.scene.remove(a.view);actors.delete(id);
 }
 function syncActor(obj,category,colors,dt,phase=0){
  const id=actorId(obj);if(!id)return null;
  let a=actors.get(id);
  if(!a)a=makeActor(id,category,colors);
  a.active=true;
  const x=Number(obj.x)||0,z=Number(obj.z)||0;
  const d=Number.isFinite(a.oldx)?Math.hypot(x-a.oldx,z-a.oldz)/Math.max(.016,dt):0;
  a.oldx=x;a.oldz=z;
  const moving=d>.55;
  if(moving && category!=='keeper'){
   const target=Math.atan2(obj.x-(a.view.position.x||0),obj.z-(a.view.position.z||0));
   if(Number.isFinite(target))a.heading+=Math.atan2(Math.sin(target-a.heading),Math.cos(target-a.heading))*Math.min(1,dt*6);
  }
  a.view.position.set(x,0,z);a.view.rotation.y=a.heading;
  if(a.oneShot>0){a.oneShot=Math.max(0,a.oneShot-dt);if(a.oneShot===0)setClip(a,moving?'run':'idle')}
  else setClip(a,moving?'run':'idle');
  a.mix.update(dt);
  return a;
 }
 function showLegacy(){
  active=false;window.YYRigEnabled=false;canvas.style.display='none';oldCanvas.style.display='';
  toggle.textContent='3D MODEL: AÇ';toggle.disabled=false;
 }
 function disable(){
  showLegacy();
  if(engine){for(const k of [...actors.keys()])dropActor(k);}
 }
 function snapshot(){try{return typeof window.YYRigSnapshot==='function'?window.YYRigSnapshot():null}catch(e){return null}}
 function sceneFrame(ts){
  requestAnimationFrame(sceneFrame);
  if(!active||!engine)return;
  const data=snapshot();
  if(!data||data.screen!=='match'||!data.match){disable();return}
  const dt=Math.min(.05,Math.max(.001,lastFrame?(ts-lastFrame)/1000:.016));lastFrame=ts;
  const {T,renderer,scene,camera,ball,selection,passRing}=engine,m=data.match,career=data.career;
  for(const a of actors.values())a.active=false;
  const shirt=career?.kit||'#d7b84e',hair=career?.hair||'#262022',skin=career?.skin||'#b78665';
  const us={skin,hair,jersey:shirt,shorts:'#e8e9e6',socks:'#f5f5ee',boots:'#1a1f28'};
  const them={skin:'#bb8b68',hair:'#242531',jersey:'#bd4e62',shorts:'#eeeae4',socks:'#f1efec',boots:'#20242a'};
  const keeperColors={skin:'#aa805d',hair:'#1b1e21',jersey:'#b9e875',shorts:'#192a36',socks:'#b9e875',boots:'#171919'};
  const hero=syncActor(m.player,'player',us,dt);
  for(const p of m.team||[])syncActor(p,'mate',us,dt);
  for(const d of m.defenders||[])syncActor(d,'defender',them,dt);
  if(m.carrier)syncActor(m.carrier,'defender',them,dt);
  if(m.keeper)syncActor(m.keeper,'keeper',keeperColors,dt);
  for(const [id,a] of actors)if(!a.active)dropActor(id);
  if(m.flight && m.flight!==lastFlight && hero){
   const foot=career?.foot==='left'?'l':'r';
   setClip(hero,m.flight.kind==='shot'?'shoot_'+foot:'pass_'+foot,true);
  }
  lastFlight=m.flight||null;
  const b=m.ball||m.player;ball.position.set(b.x||0,Math.max(.21,Number(b.y)||.21),b.z||0);
  selection.position.set(m.player.x,.035,m.player.z);selection.visible=m.mode!=='defend';
  passRing.visible=false;
  if(m.ballOwner==='me'&&typeof data.target==='object'&&data.target){passRing.visible=true;passRing.position.set(data.target.x,.038,data.target.z)}
  const target=m.flight?.kind==='pass'?m.ball:m.player;
  if(!engine.camReady){engine.cx=target.x;engine.cz=target.z;engine.camReady=true}
  const lerp=1-Math.exp(-3.3*dt);
  engine.cx+=(target.x-engine.cx)*lerp;engine.cz+=(target.z-engine.cz)*lerp;
  camera.position.set(engine.cx,3.6,engine.cz-10.8);
  camera.lookAt(engine.cx,-3.2,engine.cz+16);
  camera.fov=55;
  const w=window.innerWidth,h=window.innerHeight;
  if(engine.w!==w||engine.h!==h){
   engine.w=w;engine.h=h;
   renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  renderer.render(scene,camera);
  fpsCount++;if(!fpsSince)fpsSince=ts;
  if(ts-fpsSince>1000){frameRate=Math.round(fpsCount*1000/(ts-fpsSince));fpsSince=ts;fpsCount=0;toggle.textContent='3D MODEL '+frameRate+' FPS'}
 }
 async function enable(){
  if(busy||active)return;
  busy=true;toggle.disabled=true;toggle.textContent='3D MODEL YÜKLENİYOR';
  try{
   await setup();
   active=true;lastFrame=0;lastFlight=null;engine.camReady=false;
   canvas.style.display='block';oldCanvas.style.display='none';window.YYRigEnabled=true;
   toggle.disabled=false;toggle.textContent='3D MODEL: AÇIK';
  }catch(e){
   fault=String(e?.message||e);console.error('3D rig load failed',e);
   showLegacy();toggle.textContent='3D YÜKLEME HATASI';
   if(typeof window.YYRigNotify==='function')window.YYRigNotify('Yeni 3D açılamadı; eski görüntü etkin.');
  }finally{busy=false;toggle.disabled=false}
 }
 toggle.onclick=()=>{if(active)disable();else enable()};
 window.addEventListener('pagehide',()=>disable());
 window.addEventListener('blur',()=>{lastFrame=0});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disable();toggle.textContent='3D BAĞLANTI KOPTU'});
 window.YYRigStatus=()=>({active,ready,model:'Claude CC0-style original 22-bone GLB',fps:frameRate,actors:actors.size,calls:engine?.renderer?.info?.render?.calls||0,error:fault});
 requestAnimationFrame(sceneFrame);
})();