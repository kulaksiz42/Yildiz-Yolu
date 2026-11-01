import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
const $=s=>document.querySelector(s),canvas=$('#lab');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1));
renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#0a1c26');
scene.fog=new THREE.Fog('#0a1c26',35,85);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.07,110);
scene.add(new THREE.HemisphereLight(0xf6f6e5,0x1f4f47,2.3));
const light=new THREE.DirectionalLight(0xffe3b0,2.4);light.position.set(-3,6,4);scene.add(light);
const rim=new THREE.DirectionalLight(0xb2d3ff,1.1);rim.position.set(4,5,-5);scene.add(rim);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshLambertMaterial({color:'#256747'}));ground.rotation.x=-Math.PI/2;scene.add(ground);
for(const x of [-1.2,1.2]){const ring=new THREE.Mesh(new THREE.RingGeometry(.42,.48,48),new THREE.MeshBasicMaterial({color:x<0?'#faf5c7':'#75ceff',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.022,0);scene.add(ring);}
const players=[],loader=new GLTFLoader();
function setColors(p,colors){for(const [key,value] of Object.entries(colors)){const aliases={jersey:['jersey','shirt','kit'],shorts:['shorts'],socks:['socks'],skin:['skin'],hair:['hair'],boots:['boots','shoes']}[key]||[key];
 for(const [name,material] of p.mats){if(aliases.some(a=>name.includes(a))&&material.color)material.color.set(value);}
}}
function play(p,clip){const names=clip==='pass'?['pass_r','pass']:clip==='shoot'?['shoot_r','shoot']:[clip];let action;
 for(const n of names)if(p.actions.has(n)){action=p.actions.get(n);break}
 if(!action||p.current===action)return;const prev=p.current;p.current=action;
 action.reset().setEffectiveWeight(1).setEffectiveTimeScale(1);
 const one=clip==='pass'||clip==='shoot';action.setLoop(one?THREE.LoopOnce:THREE.LoopRepeat,one?1:Infinity);action.clampWhenFinished=one;
 if(prev)action.crossFadeFrom(prev,.16,false);action.play();p.oneShot=one;
}
function makePlayer(id,gltf,x){const root=cloneSkeleton(gltf.scene);root.position.x=x;scene.add(root);const mats=new Map(),actions=new Map();
 let bones=0,meshCount=0;root.traverse(n=>{if(n.isBone)bones++;if(n.isMesh||n.isSkinnedMesh){meshCount++;n.frustumCulled=false;n.material=Array.isArray(n.material)?n.material.map(m=>m.clone()):n.material.clone();
 for(const mat of(Array.isArray(n.material)?n.material:[n.material]))mats.set((mat.name||'').toLowerCase(),mat);}});
 const mixer=new THREE.AnimationMixer(root);for(const clip of gltf.animations)actions.set(clip.name.toLowerCase(),mixer.clipAction(clip));
 const p={id,root,mats,mixer,actions,current:null,oneShot:false,bones,meshCount};players.push(p);play(p,'idle');return p;
}
let dragging=new Map(),yaw=.25,pitch=.17,dist=7.5;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);dragging.set(e.pointerId,{x:e.clientX,y:e.clientY});});
canvas.addEventListener('pointermove',e=>{if(!dragging.has(e.pointerId))return;const old=dragging.get(e.pointerId);const before=[...dragging.values()];
 dragging.set(e.pointerId,{x:e.clientX,y:e.clientY});if(dragging.size===1){yaw+=(e.clientX-old.x)*-.006;pitch=Math.min(.8,Math.max(-.12,pitch+(e.clientY-old.y)*.004))}
 else if(dragging.size===2&&before.length===2){const vals=[...dragging.values()],d1=Math.hypot(before[0].x-before[1].x,before[0].y-before[1].y),d2=Math.hypot(vals[0].x-vals[1].x,vals[0].y-vals[1].y);dist=Math.min(15,Math.max(2.6,dist+(d1-d2)*.017));}
});
canvas.addEventListener('pointerup',e=>dragging.delete(e.pointerId));canvas.addEventListener('pointercancel',e=>dragging.delete(e.pointerId));
canvas.addEventListener('wheel',e=>{e.preventDefault();dist=Math.max(2.6,Math.min(15,dist+e.deltaY*.008))},{passive:false});
const updateClip=type=>{players.forEach(p=>play(p,type));document.querySelectorAll('button[id]').forEach(b=>b.classList.toggle('active',b.id===type))};
for(const k of ['idle','run','pass','shoot'])$('#'+k).onclick=()=>updateClip(k);
$('#red').onclick=()=>players.forEach(p=>setColors(p,{jersey:'#cb3840',shorts:'#fff8ed',socks:'#cb3840'}));
$('#blue').onclick=()=>players.forEach(p=>setColors(p,{jersey:'#2471dd',shorts:'#f6f9ff',socks:'#2471dd'}));
$('#quality').onchange=e=>{renderer.setPixelRatio(Number(e.target.value));renderer.setSize(innerWidth,innerHeight,false)};
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
let last=performance.now(),fps=0,ready=false;
function tick(now){requestAnimationFrame(tick);const dt=Math.min(.05,Math.max(.001,(now-last)/1000));last=now;fps=fps*.94+(1/dt)*.06;
 players.forEach(p=>{p.mixer.update(dt);if(p.oneShot&&p.current&&!p.current.isRunning()){p.oneShot=false;play(p,'idle')}});
 const c=Math.cos(pitch);camera.position.set(Math.sin(yaw)*dist*c,1.05+Math.sin(pitch)*dist,Math.cos(yaw)*dist*c);camera.lookAt(0,1.1,0);
 renderer.render(scene,camera);
 if(ready&&Math.floor(now/400)!==Math.floor((now-dt*1000)/400)){$('#stats').textContent='FPS '+Math.round(fps)+' · '+renderer.info.render.calls+' çağrı · '+renderer.info.render.triangles.toLocaleString('tr-TR')+' üçgen';}
}
try{const [claude,kimi]=await Promise.all([loader.loadAsync('../rigs/models/claude.glb'),loader.loadAsync('../rigs/models/kimi.glb')]);
 makePlayer('Claude',claude,-1.2);makePlayer('Kimi',kimi,1.2);ready=true;
 $('#feedback').textContent='Modeller gerçek GLB · Tek render sistemi · Animasyonları deneyebilirsin';
 window.__YY_LAB={ready:true,players,renderer,scene,camera};}catch(e){console.error('3D model lab failed',e);$('#feedback').textContent='3D yükleme hatası: '+e.message;window.__YY_LAB={ready:false,error:e.message};}
requestAnimationFrame(tick);
