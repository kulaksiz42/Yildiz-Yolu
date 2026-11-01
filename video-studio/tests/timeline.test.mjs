import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={}; vm.createContext(context);
vm.runInContext(readFileSync(new URL('../public/timeline.js',import.meta.url),'utf8'),context);
const {build,at,tokens}=context.StudioTimeline;
const video={duration:12,script:'Kapı kapandı. Elektrikler kesildi. Nereye gideceksin?',scenes:[{caption:'Giriş'},{caption:'Elektrikler kesildi'},{caption:'Karar'}]};
test('turkish narration tokenization',()=>assert.deepEqual([...tokens('İstanbul’da 3. katta!')],['İstanbul’da','3','katta']));
test('timeline covers entire narration without losing words',()=>{
 const t=build(video);assert.equal(t.source,'estimated');assert.equal(t.scenes[0].start,0);assert.equal(t.scenes.at(-1).end,12);
 assert.equal(t.scenes.reduce((sum,s)=>sum+s.wordEnd-s.wordStart,0),t.words.length);
 for(let i=1;i<t.scenes.length;i++)assert.equal(t.scenes[i].start,t.scenes[i-1].end);
 for(const point of [0,1,3,7,11.999]){const f=at(t,point);assert.ok(f.sceneIndex>=0&&f.sceneIndex<3);assert.ok(f.progress>=0&&f.progress<=1);}
});
test('aligned word timings honored and mismatch rejected',()=>{
 const words=[...tokens(video.script)];
 const aligned=words.map((text,i)=>({text,start:i*1.2,end:i*1.2+.9}));
 const t=build(video,{duration:12,wordTimings:aligned});assert.equal(t.source,'elevenlabs');
 const invalid=build(video,{duration:12,wordTimings:aligned.slice(0,-1)});assert.equal(invalid.source,'estimated');
});
test('random seek stable',()=>{
 const t=build(video);
 assert.equal(JSON.stringify(at(t,3.72)),JSON.stringify(at(t,3.72)));
});
test('empty narration and many scenes never crash',()=>{
 const t=build({duration:8,script:'',scenes:Array.from({length:10},(_,i)=>({caption:'Sahne '+i}))});
 assert.equal(t.scenes.length,10);assert.ok(at(t,7.5).subtitle);
});
test('weighted scenes have exact continuous boundaries and deterministic seeks',()=>{
 const t=build({duration:12,script:'Bir iki üç dört beş altı',scenes:[{caption:'A',weight:2},{caption:'B',weight:1}]});
 assert.equal(t.scenes[0].end,8);assert.equal(t.scenes[1].start,8);
 assert.equal(t.scenes[1].end,12);
 assert.equal(at(t,8.3).sceneIndex,1);
});
