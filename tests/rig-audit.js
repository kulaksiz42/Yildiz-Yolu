/* v0.6 procedural geometry regression; runs without any GPU or browser. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('src/logic.js','utf8');
function section(start,end){
 const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
 assert(a>=0&&b>a,'section not found: '+start);
 return src.slice(a,b);
}
const math=section('const I=()=>','let renderOK=');
const geo=section('function latheGeo(', '// Static audience batches');
const rigs=section('const PLAYER_KIT_LIGHT=', '\nfunction pitch(');
const context={Math,Float32Array};
vm.createContext(context);
vm.runInContext(math+'\n'+geo+'\n'+rigs+'\nthis.exports={I,latheGeo,segmentMatrix}',context);
const {I,latheGeo,segmentMatrix}=context.exports;
for(const profile of [
 [[-1,.65,.67],[-.66,.76,.77],[.05,.88,.86],[.65,1.05,.93],[1,.89,.77]],
 [[-1,.7,.7],[-.83,.96,.96],[-.24,1,1],[.52,.88,.88],[1,.74,.74]]
]){
 const mesh=latheGeo(profile,12);
 assert.equal(mesh.vertices.length, (profile.length-1)*12*6*3);
 assert.equal(mesh.normals.length,mesh.vertices.length);
 assert(mesh.vertices.every(Number.isFinite));
 assert(mesh.normals.every(Number.isFinite));
}
for(const a of [[0,.8,0],[1,.3,.1],[-.8,1.1,-2]]){
 for(const b of [[0,.1,0],[.2,.8,2],[0,1,0]]){
  const m=segmentMatrix(I(),a,b,.11);
  assert(m&&m.length===16&&m.every(Number.isFinite));
 }
}
console.log('PASS: anatomical meshes and joint matrices are finite; GPU not required');