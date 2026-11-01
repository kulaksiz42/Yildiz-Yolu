/* Shared deterministic speech/scene clock for preview and MP4 renderer.
   Actual word timings from ElevenLabs when available; otherwise EXPLICITLY estimated. */
(function (host) {
  'use strict';
  const tokens = text => String(text || '').match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
  const norm = s => String(s || '').toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]/gu, '');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function allocate(count, weights) {
    const n = weights.length;
    if (!n) return [];
    const result = Array(n).fill(0);
    if (count >= n) result.fill(1);
    let remain = count - result.reduce((a,b)=>a+b,0);
    const denom = Math.max(1,weights.reduce((a,b)=>a+b,0));
    const parts = weights.map(w=>remain*w/denom);
    parts.forEach((v,i)=>{ const k=Math.floor(v); result[i]+=k;remain-=k; });
    const order=parts.map((v,i)=>({i,f:v-Math.floor(v)})).sort((a,b)=>b.f-a.f||a.i-b.i);
    for(let i=0;i<remain;i++)result[order[i%order.length].i]++;
    return result;
  }
  function estimatedWords(words,duration) {
    if (!words.length) return [];
    const start=duration>0.6?0.16:0;
    const end=Math.max(start+0.01,duration-0.12);
    const weights=words.map(w=>Math.max(1,Math.min(15,w.length))*0.6+1);
    const sum=weights.reduce((a,b)=>a+b,0);
    let cursor=start;
    return words.map((word,i)=>{
      const size=(end-start)*weights[i]/sum;
      const entry={text:word,start:+cursor.toFixed(4),end:+(cursor+size).toFixed(4)};
      cursor+=size; return entry;
    });
  }
  function validTimings(words,input,duration) {
    if(!Array.isArray(input)||input.length!==words.length)return false;
    let last=0;
    for(let i=0;i<words.length;i++){
      const x=input[i];
      if(norm(x.text)!==norm(words[i]) || !Number.isFinite(x.start) || !Number.isFinite(x.end) || x.start<last-0.025 || x.end<x.start || x.end>duration+0.8)return false;
      last=x.end;
    }
    return true;
  }
  function build(video, override={}) {
    const duration=clamp(Number(override.duration ?? video.duration)||18,1,3600);
    const scenes=Array.isArray(video.scenes)&&video.scenes.length ? video.scenes : [{caption:video.title||'Video'}];
    const text=String(video.script||scenes.map(s=>s.narration||s.caption).join(' '));
    const words=tokens(text);
    const provided=override.wordTimings || video.word_timings;
    const measured=validTimings(words,provided,duration);
    const allWords=measured?provided.map(w=>({...w})):estimatedWords(words,duration);
    const counts=allocate(words.length,scenes.map(s=>Math.max(1,tokens(s.narration||s.caption).length)));
    let pos=0;
    const segments=scenes.map((scene,i)=>{
      const begin=pos;pos+=counts[i];
      const first=allWords[begin], last=allWords[pos-1];
      const previous=allWords[begin-1],next=allWords[pos];
      const start=i===0?0:first&&previous?(first.start+previous.end)/2:duration*i/scenes.length;
      const end=i===scenes.length-1?duration:last&&next?(last.end+next.start)/2:duration*(i+1)/scenes.length;
      return {index:i,caption:String(scene.caption||video.title||''),start:+start.toFixed(4),end:+end.toFixed(4),wordStart:begin,wordEnd:pos};
    });
    // Explicit storyboard weights set a coherent shot clock, without relying on frame playback.
    // Older stories with no weights retain their original speech-distribution timeline.
    const hasWeights=scenes.some(s=>s.weight!=null);
    if (hasWeights) {
      const weights=scenes.map(s=>clamp(Number(s.weight)||1,.25,8));
      const total=weights.reduce((a,b)=>a+b,0);
      let cursor=0;
      segments.forEach((seg,i)=>{
        seg.start=+cursor.toFixed(4);
        cursor += duration * weights[i]/total;
        seg.end=i===segments.length-1?duration:+cursor.toFixed(4);
      });
    }
    // Ensure continuous segments even with very short scripts and many scenes.
    for(let i=0;i<segments.length-1;i++) {
      const boundary=clamp(segments[i].end,segments[i].start,duration);
      segments[i].end=boundary;segments[i+1].start=boundary;
    }
    return {duration,source:measured?'elevenlabs':'estimated',words:allWords,scenes:segments};
  }
  function at(timeline,t) {
    const elapsed=clamp(Number(t)||0,0,Math.max(0,timeline.duration-0.00001));
    const scene=timeline.scenes.find(s=>elapsed>=s.start&&elapsed<s.end)||timeline.scenes[timeline.scenes.length-1];
    let active=timeline.words.findIndex(w=>elapsed>=w.start&&elapsed<w.end);
    if(active<0)active=timeline.words.findIndex(w=>elapsed<w.start);
    if(active<0)active=Math.max(0,timeline.words.length-1);
    // Subtitle window changes every ~4 words, with no global timing drift.
    const first=Math.floor(Math.max(0,active)/4)*4;
    const captionWords=timeline.words.slice(first,Math.min(first+4,timeline.words.length));
    const subtitle=captionWords.map(w=>w.text).join(' ')||scene.caption;
    return {scene,sceneIndex:scene.index,progress:clamp((elapsed-scene.start)/Math.max(.001,scene.end-scene.start),0,1),activeWord:active,subtitle};
  }
  host.StudioTimeline={build,at,tokens,validTimings};
})(typeof window==='undefined'?globalThis:window);
