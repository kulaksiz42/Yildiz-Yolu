/* Deterministic Canvas renderer shared by browser preview and Playwright frame capture.
   No AI-generated images or third-party assets. Original drawing primitives. */
(function(global){
  'use strict';
  const W=540,H=960,TAU=Math.PI*2;
  function fill(ctx,c){ctx.fillStyle=c;}
  function rect(ctx,x,y,w,h,r=0,color='#fff'){
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);fill(ctx,color);ctx.fill();
  }
  function line(ctx,coords,color,width=3){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();coords.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function circle(ctx,x,y,r,c){ctx.beginPath();ctx.arc(x,y,r,0,TAU);fill(ctx,c);ctx.fill();}
  function gradient(ctx,a,b){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,a);g.addColorStop(1,b);rect(ctx,0,0,W,H,0,g);}
  function ease(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
  function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function wrap(ctx,str,maxWidth){const words=String(str).split(/\s+/),lines=[];let acc='';for(const word of words){const next=(acc?acc+' ':'')+word;if(ctx.measureText(next).width>maxWidth&&acc){lines.push(acc);acc=word;}else acc=next;}if(acc)lines.push(acc);return lines;}
  function text(ctx,str,x,y,{size=35,color='#fff',align='left',weight=700,maxWidth=480,lineHeight=1.2,shadow=false}={}){
    ctx.font=`${weight} ${size}px system-ui, Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='top';
    const lines=wrap(ctx,str,maxWidth);if(shadow){ctx.shadowColor='#000a';ctx.shadowBlur=14;ctx.shadowOffsetY=4;}
    fill(ctx,color);for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x,y+i*size*lineHeight);
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;return lines.length*size*lineHeight;
  }
  function stickman(ctx,x,y,scale=1,color='#f2eede',wave=0){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    circle(ctx,0,-75,21,color);
    line(ctx,[[0,-49],[0,20]],color,10);
    line(ctx,[[0,-33],[-42,-5-wave]],color,8);
    line(ctx,[[0,-33],[39,-18+wave]],color,8);
    line(ctx,[[0,20],[-32,80]],color,9);
    line(ctx,[[0,20],[31,80]],color,9);
    ctx.restore();
  }
  function topbar(ctx,video,index,total,label){
    rect(ctx,30,38,480,6,3,'#ffffff30');rect(ctx,30,38,480*(index+1)/total,6,3,'#f5d26b');
    rect(ctx,30,65,150,30,8,'#131c2dbb');text(ctx,label.toUpperCase(),43,72,{size:14,weight:800,color:'#fbd780'});
    text(ctx,`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,503,72,{size:16,align:'right',weight:700,color:'#f1f5f9'});
  }
  function captions(ctx,caption,anim){
    rect(ctx,25,722,490,179,22,'#060d20d9');rect(ctx,25,722,5,179,2,'#f9c457');
    const y=755-12*(1-ease(anim));const h=text(ctx,caption,56,y,{size:33,color:'#fff',maxWidth:430,weight:800,lineHeight:1.24,shadow:true});
    if(h>125)text(ctx,'',56,y);
    rect(ctx,54,877,Math.min(425,425*ease(anim)),4,3,'#f9c457');
  }
  function survival(ctx,scene,index,progress,time,video){
    gradient(ctx,'#0b1a31','#091021');
    const drift=Math.sin(time*.55)*9;
    for(let i=0;i<11;i++){
      const x=i*70-25,y=205+(i%3)*33;
      rect(ctx,x,y,57,420-(i%3)*20,0,i%2?'#162840':'#1b3047');
      for(let k=0;k<5;k++)rect(ctx,x+11+(k%2)*21,y+28+Math.floor(k/2)*67,9,18,1,(i+k)%3?'#e5b86b95':'#34465f');
    }
    // Deep perspective pathway
    const road=ctx.createLinearGradient(0,425,0,750);road.addColorStop(0,'#29354b');road.addColorStop(1,'#070d1a');
    ctx.beginPath();ctx.moveTo(200,465);ctx.lineTo(340,465);ctx.lineTo(560,748);ctx.lineTo(-20,748);ctx.closePath();fill(ctx,road);ctx.fill();
    for(let n=0;n<5;n++){const q=(n+1)/6;rect(ctx,260-3-q*3,490+q*q*217,6+q*7,12+q*17,2,'#f2dca380');}
    circle(ctx,440,190,45,'#c1c5cf33');
    stickman(ctx,252+drift,566,1.05,'#dce8f5',Math.sin(time*4)*12);
    rect(ctx,30,130,480,69,13,'#10273cca');text(ctx,'DAY 01    •    23:47',49,147,{size:24,color:'#f9cf72',weight:800});
    rect(ctx,372,148,110,23,5,'#22334c');rect(ctx,376,152,15+90*Math.max(.09,1-time/(video.duration*1.1)),15,3,'#ef9476');
    if(index>=1){rect(ctx,51,600,438,67,12,'#111b2fe6');text(ctx,index===1?'ŞARJ: %12  •  BAĞLANTI YOK':'KARAR SENİN: A MI, B Mİ?',72,623,{size:20,color:'#9bd9ff'});}
  }
  function explainer(ctx,scene,index,progress,time){
    gradient(ctx,'#171a38','#22275b');
    // soft glowing graphic shapes
    for(let i=0;i<6;i++)circle(ctx,(i*101+Math.sin(time*.6+i)*17)%560,160+i*90,55+i*3,'#6378df12');
    rect(ctx,33,146,473,105,19,'#eef2ff');
    text(ctx,index===0?'1. TEMEL FİKİR':index===1?'2. NEDEN ÖNEMLİ?':index===2?'3. NASIL ÇALIŞIR?':'4. SIRA SENDE',58,178,{size:26,color:'#242d5b',weight:900});
    rect(ctx,54,281,440,280,20,'#ffffff14');
    const icons=['◎','✦','→','✓'];
    circle(ctx,274,348,48,'#7ee9ca');text(ctx,icons[index%icons.length],274,317,{size:64,color:'#20335d',align:'center'});
    for(let k=0;k<3;k++){const v=ease(progress*3-k*.4);rect(ctx,93,430+k*34,350*v,12,6,k%2?'#84a3ff':'#b2c6ff');}
    // stylised speaking teacher, original vectors
    circle(ctx,400,641,90,'#0a15337a');rect(ctx,326,669,148,90,23,'#55b9a8');
    circle(ctx,399,612+Math.sin(time*4)*2,58,'#f0c4a4');
    ctx.beginPath();ctx.arc(396,596,58,Math.PI*1.03,TAU*.99);fill(ctx,'#17213d');ctx.fill();
    circle(ctx,378,612,5,'#202840');circle(ctx,421,612,5,'#202840');
    line(ctx,[[385,637],[414,637+Math.sin(time*9)*3]],'#7b4250',3);
  }
  function whatif(ctx,scene,index,progress,time){
    gradient(ctx,'#413857','#d07c76');
    circle(ctx,400,230,120,'#f7c5ab77');
    for(let i=0;i<10;i++){const x=i*69-40;ctx.beginPath();ctx.moveTo(x,625);ctx.lineTo(x+45,460+(i%4)*28);ctx.lineTo(x+85,625);fill(ctx,i%2?'#3b3552':'#52405a');ctx.fill();}
    rect(ctx,0,624,W,130,0,'#24293e');
    for(let k=0;k<15;k++)line(ctx,[[k*43,696],[k*43+12,708]],'#60637a',2);
    const bounce=Math.sin(time*2.4)*9;
    stickman(ctx,235+progress*75,575+bounce,1.5,'#141b2d',Math.sin(time*3)*8);
    circle(ctx,356,516,40,'#fff9ebc8');text(ctx,index%2?'?!':'?',356,477,{size:50,color:'#282c49',align:'center',weight:900});
    rect(ctx,32,136,475,59,13,'#111b3ba8');text(ctx,'YA BÖYLE OLSAYDI?',53,154,{size:25,color:'#ffe7b2',weight:900});
  }
  function backyard(ctx,scene,index,progress,time){
    gradient(ctx,'#a6d9ef','#d4edf1');
    circle(ctx,443,163,71,'#fff7d5');
    // floating isometric terrain cutaway
    const left=55,right=488,top=340,bottom=671;
    ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(270,top-88);ctx.lineTo(right,top);ctx.lineTo(272,top+108);ctx.closePath();fill(ctx,'#84bd73');ctx.fill();
    ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(272,top+108);ctx.lineTo(272,bottom);ctx.lineTo(left,bottom-115);ctx.closePath();fill(ctx,'#8e513c');ctx.fill();
    ctx.beginPath();ctx.moveTo(272,top+108);ctx.lineTo(right,top);ctx.lineTo(right,bottom-115);ctx.lineTo(272,bottom);ctx.closePath();fill(ctx,'#613d35');ctx.fill();
    for(let i=0;i<4;i++){
      const y=440+i*53;
      line(ctx,[[55,y],[272,y+100]],i%2?'#b97850':'#6c4639',15);
      line(ctx,[[272,y+100],[488,y-7]],i%2?'#704a39':'#a16c4a',15);
    }
    // raised foundation and basic house
    rect(ctx,133,229,176,105,8,'#e9ebdb');
    ctx.beginPath();ctx.moveTo(114,231);ctx.lineTo(223,162);ctx.lineTo(332,231);ctx.closePath();fill(ctx,'#bd6760');ctx.fill();
    rect(ctx,164,267,44,67,3,'#6599ad');rect(ctx,244,270,36,64,4,'#d3b79c');
    // pond added over time
    const appear=ease(progress*2+(index-1)*.38);
    ctx.save();ctx.globalAlpha=appear;
    ctx.beginPath();ctx.ellipse(367,376,73,29,-.23,0,TAU);fill(ctx,'#347cbb');ctx.fill();
    for(let i=0;i<5;i++)circle(ctx,326+i*14,366+Math.sin(time*2+i)*7,3,'#c2f1ff');
    ctx.restore();
    for(let i=0;i<9;i++){
      const x=70+i*48,y=335+Math.sin(i*2)*11;
      line(ctx,[[x,y],[x+4,y-21]],'#d1ad85',5);
    }
    rect(ctx,27,110,485,75,14,'#19364cae');text(ctx,'KESİT GÖRÜNÜMÜ  /  KATMANLAR',45,131,{size:23,color:'#f9fcff',weight:900});
  }
  const timelineCache=new WeakMap();
  function render(canvas,video,t){
    if(!canvas||!video)return;
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');
    const scenes=Array.isArray(video.scenes)&&video.scenes.length?video.scenes:[{caption:video.title}];
    const duration=Math.max(1,Number(video.duration)||18);
    const elapsed=Math.max(0,Math.min(duration-.001,Number(t)||0));
    let timeline=timelineCache.get(video);
    if (!timeline || timeline.duration!==duration || timeline.__data!==video.timeline) {
      timeline=video.timeline && video.timeline.duration===duration ? video.timeline : global.StudioTimeline?.build(video,{duration});
      if(timeline){timeline.__data=video.timeline;timelineCache.set(video,timeline);}
    }
    const timed=timeline?global.StudioTimeline.at(timeline,elapsed):null;
    const phase=elapsed/duration*scenes.length;
    const index=timed?timed.sceneIndex:Math.min(scenes.length-1,Math.floor(phase));
    const progress=timed?timed.progress:phase-index;
    const scene=scenes[index];
    const type=video.style;
    if(type==='explainer')explainer(ctx,scene,index,progress,elapsed);
    else if(type==='whatif')whatif(ctx,scene,index,progress,elapsed);
    else if(type==='backyard')backyard(ctx,scene,index,progress,elapsed);
    else survival(ctx,scene,index,progress,elapsed,video);
    topbar(ctx,video,index,scenes.length,type==='survival'?'SURVIVAL':type==='explainer'?'EXPLAINER':type==='backyard'?'DIORAMA':'WHAT IF');
    captions(ctx,timed?.subtitle||scene.caption||video.title,progress);
    text(ctx,'KULAKSIZ VIDEO STUDIO',270,922,{size:15,color:type==='backyard'?'#263848':'#d1ddf1',align:'center',weight:800});
    return {index,progress,duration,alignment:timeline?.source||'none',activeWord:timed?.activeWord??-1};
  }
  global.StudioDraw={render,W,H};
})(window);
