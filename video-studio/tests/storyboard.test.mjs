import test from 'node:test';
import assert from 'node:assert/strict';
import { makeStory,cleanUpdate,cleanScenes,RENDER_FPS,RENDER_SIZES } from '../scripts/story.mjs';

test('new stories require storyboard approval',()=>{
 const v=makeStory({title:'Kararan şehir'});
 assert.equal(v.storyboard_approved,false);
 assert.equal(v.scenes.length,3);
 assert.equal(v.scenes[0].weight,1);
});
test('scene editing preserves order, shots, weights and joins narration',()=>{
 const v=makeStory({title:'Gizemli merdiven'});
 const scenes=[{caption:'Birinci sahne',narration:'Kapı kapandı.',shot:'close',weight:2,detail:'Karanlık koridor'},{caption:'İkinci sahne',narration:'Yolu aradım.',shot:'pan-left',weight:.5}];
 const changed=cleanUpdate({...v,storyboard_approved:true},{scenes,sync_narration:true,render_fps:24,render_size:1080});
 assert.equal(changed.scenes[0].shot,'close');assert.equal(changed.scenes[1].weight,.5);
 assert.equal(changed.script,'Kapı kapandı. Yolu aradım.');assert.equal(changed.storyboard_approved,false);
 assert.equal(changed.render_fps,24);assert.equal(changed.render_size,1080);
});
test('invalid scenes and invalid presets rejected',()=>{
 const v=makeStory({title:'Çok farklı bir konu'});
 assert.throws(()=>cleanScenes([{caption:'tek'}]));
 assert.throws(()=>cleanUpdate(v,{scenes:[{caption:'Olur',narration:'Ses',weight:-1},{caption:'Bitti',narration:'Ses'}]}));
 assert.throws(()=>cleanUpdate(v,{render_fps:73}));
 assert.throws(()=>cleanUpdate(v,{render_size:720}));
 assert.deepEqual(RENDER_FPS,[12,24,30]);assert.deepEqual(RENDER_SIZES,[540,1080]);
});
test('script edits invalidate approval; scheduling alone preserves approval',()=>{
 const v={...makeStory({title:'Kayıp şehir'}),storyboard_approved:true};
 assert.equal(cleanUpdate(v,{scheduled_at:'2026-11-05T18:00:00Z'}).storyboard_approved,true);
 assert.equal(cleanUpdate(v,{script:'Yeni ses.'}).storyboard_approved,false);
});
