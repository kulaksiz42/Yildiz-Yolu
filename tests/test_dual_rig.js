'use strict';
/* Self-hosted dual-GLB regression; runs on Node without GPU or npm. */
const fs=require('node:fs'),assert=require('node:assert/strict');
function parseGLB(path){
 const data=fs.readFileSync(path);
 assert.equal(data.toString('ascii',0,4),'glTF',path+': magic');
 assert.equal(data.readUInt32LE(4),2,path+': version');
 assert.equal(data.readUInt32LE(8),data.length,path+': file size');
 const length=data.readUInt32LE(12);assert.equal(data.readUInt32LE(16),0x4E4F534A);
 const gltf=JSON.parse(data.toString('utf8',20,20+length));
 assert(gltf.meshes?.length>0&&gltf.skins?.length>0);
 assert(gltf.animations?.every(x=>x.channels?.length>0));
 assert(gltf.buffers?.length>0);
 return gltf;
}
const a=parseGLB('rigs/models/claude.glb'),b=parseGLB('rigs/models/kimi.glb');
assert.equal(a.skins[0].joints.length,22);assert.equal(b.skins[0].joints.length,53);
const ca=new Set(a.animations.map(x=>x.name.toLowerCase()));
const cb=new Set(b.animations.map(x=>x.name.toLowerCase()));
for(const c of ['idle','run','pass_r','pass_l','shoot_r','shoot_l'])assert(ca.has(c),'Claude '+c);
for(const c of ['idle','run','pass','shoot'])assert(cb.has(c),'Kimi '+c);
for(const p of ['rigs/vendor/three.module.js','rigs/vendor/three.core.js','rigs/vendor/addons/loaders/GLTFLoader.js','rigs/vendor/addons/utils/SkeletonUtils.js','rigs/vendor/LICENSE']){
 assert(fs.statSync(p).size>300,p+' missing');
}
const game=fs.readFileSync('src/logic.js','utf8'),tpl=fs.readFileSync('src/template.html','utf8');
const lab=fs.readFileSync('labs/rig-compare.mjs','utf8'),runtime=fs.readFileSync('rigs/game-rigs.mjs','utf8');
const legacy=fs.readFileSync('assets/rig/bridge.js','utf8');
assert(game.includes('YY_RIG_EXPERIMENT')&&game.includes('window.__YYRIG_SNAPSHOT'));
assert(game.includes("get('rig3d')==='1'")&&game.includes("if(renderOK||window.__YYRIG_ACTIVE)return"));
assert(tpl.includes('type="importmap"')&&tpl.includes('id="rig-canvas"'));
assert(legacy.includes("get('rig3d')==='1')return"),'legacy renderer must not activate concurrently');
for(const name of ['claude.glb','kimi.glb']){assert(runtime.includes(name));assert(lab.includes(name));}
assert(!runtime.includes('cdn.jsdelivr.net')&&!lab.includes('cdn.jsdelivr.net'));
console.log('PASS: 2 valid skinned GLBs, 10 animation clips, offline Three r180, and safe opt-in GLB bridge');
