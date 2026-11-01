import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeStory,cleanUpdate} from '../scripts/story.mjs';
const pilot=JSON.parse(fs.readFileSync(new URL('../examples/apple-soil.json',import.meta.url),'utf8'));
test('apple soil pilot is a valid six-beat storyboard',()=>{
  assert.equal(pilot.scenes.length,6);
  assert.equal(pilot.style,'backyard');
  assert.ok(pilot.scenes.every(s=>s.detail.length<=180));
  const result=cleanUpdate(makeStory(pilot),{scenes:pilot.scenes,sync_narration:true,visual_preset:pilot.visual_preset});
  assert.equal(result.visual_preset,'apple-soil-v1');
  assert.ok(result.script.includes('toprağın altında'));
  assert.equal(result.storyboard_approved,false);
});
test('wrong styles and arbitrary visual presets are rejected',()=>{
  assert.throws(()=>cleanUpdate(makeStory({title:'Deneme survival',style:'survival'}),{visual_preset:'apple-soil-v1'}));
  assert.throws(()=>cleanUpdate(makeStory({title:'Deneme backyard',style:'backyard'}),{visual_preset:'unknown'}));
});
test('other video styles retain their existing visual presets',()=>{
  const x=makeStory({title:'Normal bahçe yapımı',style:'backyard'});
  assert.equal(x.visual_preset,null);
});
