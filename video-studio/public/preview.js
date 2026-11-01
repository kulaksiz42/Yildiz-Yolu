(async()=>{
const id=new URLSearchParams(location.search).get('id');const r=await fetch('/api/videos');if(!r.ok){location.href='/';return;}
const {videos}=await r.json(),video=videos.find(v=>v.id===id);if(!video){document.querySelector('#previewTitle').textContent='Video bulunamadı';return;}
document.querySelector('#previewTitle').textContent=video.title;
if(video.render_status==='ready'){
  try{const response=await fetch(`/api/videos/${video.id}/timeline`);
    if(response.ok)video.timeline=await response.json();
  }catch{} // Non-rendered preview uses explicitly estimated timing.
}
let t=0,playing=false,last=0;const canvas=document.querySelector('#screen');const progress=document.querySelector('#progress'),timestamp=document.querySelector('#timestamp');
function render(){window.StudioDraw.render(canvas,video,t);progress.value=(100*t/video.duration).toFixed(2);timestamp.textContent=`0:${String(Math.floor(t)).padStart(2,'0')}`;}
function frame(now){if(playing){if(last)t+=(now-last)/1000;if(t>=video.duration){t=0;playing=false;document.querySelector('#toggle').textContent='▶ Oynat';}render();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
progress.oninput=()=>{t=Number(progress.value)/100*video.duration;render();};
document.querySelector('#toggle').onclick=()=>{playing=!playing;last=0;document.querySelector('#toggle').textContent=playing?'⏸ Duraklat':'▶ Oynat';};render();
})();
