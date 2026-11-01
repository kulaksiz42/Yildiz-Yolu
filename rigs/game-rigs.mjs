/* Yildiz Yolu: OPTIONAL GLB render experiment (?rig3d=1).
   One Three.js WebGLRenderer; old WebGL engine is disabled in this mode.
   Gameplay, AI, physics and localStorage remain in src/logic.js.
   Assets: user-provided Claude & Kimi .glb, Three.js r180 MIT.
*/
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
const $=s=>document.querySelector(s);
const canvas=$('#rig-canvas'),status=$('#rig-status');
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#101e27');scene.fog=new THREE.Fog('#101e27',60,170);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.08,240);
scene.add(new THREE.HemisphereLight(0xddeffa,0x23513e,2.2));
const light=new THREE.DirectionalLight(0xffe8c6,2.4);light.position.set(-18,34,13);scene.add(light);
const second=new THREE.DirectionalLight(0xb5d5ff,1);second.position.set(19,20,-25);scene.add(second);
const stadium=new THREE.Group();scene.add(stadium);
const pitch=new THREE.Mesh(new THREE.PlaneGeometry(68,105),new THREE.MeshLambertMaterial({color:'#216847'}));pitch.rotation.x=-Math.PI/2;stadium.add(pitch);
for(let i=0;i<16;i++){const shade=new THREE.Mesh(new THREE.PlaneGeometry(68,105/16),new THREE.MeshLambertMaterial({color:i%2?'#216c48':'#28794e'}));shade.rotation.x=-Math.PI/2;shade.position.set(0,.008,-52.5+(i+.5)*105/16);stadium.add(shade)}
const whiteLine=new THREE.LineBasicMaterial({color:'#ecf4e9'});
function line(arr){stadium.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arr.map(([x,z])=>new THREE.Vector3(x,.022,z))),whiteLine))}
line([[-34,-52.5],[-34,52.5],[34,52.5],[34,-52.5],[-34,-52.5]]);
line([[-34,0],[34,0]]);
const circle=[];for(let i=0;i<=70;i++){const a=i*Math.PI*2/70;circle.push([9.15*Math.cos(a),9.15*Math.sin(a)])}line(circle);
for(const z of [-52.5,52.5]){
 const d=z>0?-1:1;
 line([[-20.16,z],[-20.16,z+d*16.5],[20.16,z+d*16.5],[20.16,z]]);
 line([[-9.16,z],[-9.16,z+d*5.5],[9.16,z+d*5.5],[9.16,z]]);
 const mat=new THREE.MeshBasicMaterial({color:'#fafafa'});
 for(const x of [-3.66,3.66]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.44,8),mat);p.position.set(x,1.22,z);stadium.add(p)}
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,7.32,8),mat);bar.rotation.z=Math.PI/2;bar.position.set(0,2.44,z);stadium.add(bar);
}
for(const x of [-43,43])for(let i=0;i<3;i++){const stand=new THREE.Mesh(new THREE.BoxGeometry(5,2,114),new THREE.MeshLambertMaterial({color:i%2?'#324451':'#283944'}));stand.position.set(x+(x>0?i*5:-i*5),i*2.1+1,0);stadium.add(stand)}
const ball=new THREE.Mesh(new THREE.SphereGeometry(.11,12,9),new THREE.MeshStandardMaterial({color:'#f2f5ea',roughness:.6}));scene.add(ball);
const models={},actors=new Map();const loader=new GLTFLoader();let last=performance.now(),camX=0,camZ=13,camReady=false,currentScreen='';
function spawn(id,type){if(!models[type])return null;const src=models[type],root=cloneSkeleton(src.scene),mixer=new THREE.AnimationMixer(root),actions=new Map(),materials=new Map();
 root.traverse(n=>{if(!n.isMesh&&!n.isSkinnedMesh)return;n.frustumCulled=false;
  n.material=Array.isArray(n.material)?n.material.map(m=>m.clone()):n.material.clone();
  for(const mat of (Array.isArray(n.material)?n.material:[n.material]))materials.set((mat.name||'').toLowerCase(),mat);
 });
 for(const clip of src.animations)actions.set(clip.name.toLowerCase(),mixer.clipAction(clip));
 const p={id,root,mixer,actions,materials,type,current:null,until:0,lastColors:null};actors.set(id,p);scene.add(root);return p;
}
function recolor(p,c){if(!c)return;const code=JSON.stringify(c);if(code===p.lastColors)return;p.lastColors=code;
 const wanted={skin:c.skin||'#c99573',hair:c.hair||'#25232a',jersey:c.kit||'#e9c361',shorts:c.shorts||'#eef0ec',socks:c.socks||'#e4e9e4',boots:c.boots||'#161d24'};
 for(const [name,m] of p.materials){if(!m.color)continue;
  for(const [key,value] of Object.entries(wanted)){if(name===key||name.includes(key)||(key==='jersey'&&name.includes('shirt'))){m.color.set(value);break}}
 }
}
function animate(p,name){const map=p.type==='kimi'?{idle:'idle',run:'run',pass:'pass',shoot:'shoot'}:{idle:'idle',run:'run',pass:'pass_r',shoot:'shoot_r'};
 const n=map[name]||'idle',a=p.actions.get(n);if(!a||p.current===n)return;
 const prev=p.actions.get(p.current);a.reset();a.setEffectiveWeight(1);a.setEffectiveTimeScale(1);
 const one=name==='pass'||name==='shoot';a.setLoop(one?THREE.LoopOnce:THREE.LoopRepeat,one?1:Infinity);a.clampWhenFinished=one;
 if(prev)a.crossFadeFrom(prev,.16,false);a.play();p.current=n;p.until=one?performance.now()+a.getClip().duration*1000:0;
}
const active=new Set();
function actor(id,type,x,z,rotation,colors,mode){active.add(id);let p=actors.get(id)||spawn(id,type);if(!p)return;
 p.root.visible=true;p.root.position.set(x,0,z);p.root.rotation.y=rotation||0;recolor(p,colors);
 if(!p.until||performance.now()>=p.until)animate(p,mode||'idle');
}
function snapshot(){return window.__YYRIG_SNAPSHOT?.()||null}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize,{passive:true});
function loop(time){requestAnimationFrame(loop);const dt=clamp((time-last)/1000,.001,.05);last=time;
 const info=snapshot();if(!info)return;
 const {screen,match,career,draft,joy}=info;active.clear();
 const c=career||draft||{},self={skin:c.skin,hair:c.hair,kit:c.kit||'#edc365',shorts:'#e9eeec'};
 let eye=[9,6,-2],target=[0,1,25],fov=56;
 if(screen!==currentScreen){currentScreen=screen;camReady=false}
 if(screen==='create'){
  stadium.visible=false;ball.visible=false;actor('hero','kimi',0,0,0,self,'idle');eye=[2.8,2.65,6.5];target=[0,1,0];fov=45;
 }else if(screen==='story'){
  stadium.visible=false;ball.visible=false;actor('hero','kimi',1.5,-3,0,self,'idle');actor('coach','claude',-1.5,-3,0,{skin:'#b18a67',hair:'#292a28',kit:'#344d61'},'idle');
  eye=[1,3,6.8];target=[0,1.3,-3];fov=54;
 }else if(screen==='match'&&match){
  stadium.visible=true;ball.visible=true;
  actor('hero','kimi',match.player.x,match.player.z,0,self,match.flight?.kind==='shot'?'shoot':match.flight?.kind==='pass'?'pass':Math.abs(joy?.x||0)+Math.abs(joy?.y||0)>.1?'run':'idle');
  for(const [i,p] of (match.team||[]).slice(0,4).entries())actor('mate'+i,'claude',p.x,p.z,0,{skin:'#cfa07a',hair:'#26272c',kit:self.kit},'run');
  for(const [i,p] of (match.defenders||[]).slice(0,5).entries())actor('def'+i,'claude',p.x,p.z,Math.PI,{skin:'#b98669',hair:'#25262a',kit:'#b84f65'},'run');
  if(match.carrier)actor('carrier','claude',match.carrier.x,match.carrier.z,Math.PI,{skin:'#b98669',kit:'#b84f65'},'run');
  actor('keeper','claude',match.keeper?.x||0,49,Math.PI,{skin:'#bc8d69',kit:'#a7c680'},'idle');
  ball.position.set(match.ball?.x||0,Math.max(.11,match.ball?.y||.11),match.ball?.z||0);
  const follow=match.flight?.kind==='pass'?match.ball:match.player;
  if(!camReady){camX=follow.x;camZ=follow.z;camReady=true}
  const smooth=1-Math.exp(-3*dt);camX+=(follow.x-camX)*smooth;camZ+=(follow.z-camZ)*smooth;
  eye=[camX,3.7,camZ-10.8];target=[camX,1.2,camZ+16];fov=55;
 }else{
  stadium.visible=true;ball.visible=true;ball.position.set(1,.11,21);
  actor('hero','kimi',-1,20,0,self,'idle');actor('rival','claude',3,28,Math.PI,{kit:'#b64d62',skin:'#c09070'},'idle');
  eye=screen==='hub'||screen==='result'?[7,7,4]:[9,6,-3];target=[0,1,26];
 }
 for(const [id,p] of actors){p.root.visible=active.has(id);if(p.root.visible)p.mixer.update(dt)}
 camera.fov=fov;camera.position.set(...eye);camera.lookAt(...target);camera.updateProjectionMatrix();
 renderer.render(scene,camera);
 if(Math.floor(time/500)!==Math.floor((time-dt*1000)/500))status.textContent='GLB · '+renderer.info.render.calls+' çizim · '+renderer.info.render.triangles.toLocaleString('tr-TR')+' üçgen';
}
try{
 const [claude,kimi]=await Promise.all([loader.loadAsync('./rigs/models/claude.glb'),loader.loadAsync('./rigs/models/kimi.glb')]);
 models.claude=claude;models.kimi=kimi;
 window.__YYRIG_ACTIVE=true;canvas.hidden=false;$('#world').style.opacity='0';
 status.textContent='3D iskeletli futbolcular aktif';
 requestAnimationFrame(loop);
}catch(e){console.error('Yildiz Yolu GLB module failed:',e);window.__YYRIG_ACTIVE=false;canvas.hidden=true;status.textContent='GLB yüklenemedi · Eski görüntü aktif';}
