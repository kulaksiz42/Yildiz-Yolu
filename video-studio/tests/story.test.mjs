import test from 'node:test';
import assert from 'node:assert/strict';
import {makeStory,cleanUpdate,safeId,STYLES} from '../scripts/story.mjs';
test('four styles available',()=>assert.equal(STYLES.length,4));
test('create a video in Turkish',()=>{
  const v=makeStory({title:'10. katta mahsur kaldın',style:'survival',duration:22});
  assert.equal(v.style,'survival'); assert.equal(v.duration,22);assert.equal(v.render_status,'pending');assert.equal(v.publish_status,'draft');assert.ok(v.scenes.length>=3);assert.ok(safeId(v.id));
});
test('invalid title blocked',()=>assert.throws(()=>makeStory({title:'x'})));
test('duration clamped and no html',()=>{const v=makeStory({title:'<script>Hi</script>',duration:999});assert.equal(v.duration,90);assert.ok(!v.title.includes('<'));});
test('scheduling is not fake publication',()=>{const v=makeStory({title:'Bir gizemli hikaye'});const next=cleanUpdate(v,{scheduled_at:'2026-11-02T18:00:00Z',platforms:['instagram','youtube','invalid']});assert.equal(next.publish_status,'planned');assert.deepEqual(next.platforms,['instagram','youtube']);assert.equal(next.render_status,'pending');});
test('invalid schedule blocked',()=>assert.throws(()=>cleanUpdate(makeStory({title:'Bir hikaye'}),{scheduled_at:'tomorrow-ish'})));
