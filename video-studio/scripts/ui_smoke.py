#!/usr/bin/env python3
"""Offline browser UI smoke using mocked API; API and MP4 separately tested in smoke.py.
Chromium network navigation may be prohibited in secure CI; inject the real page and scripts.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(ROOT/'public/index.html').read_text(encoding='utf8')
 html=html.replace('<script src="/timeline.js"></script><script src="/draw.js"></script><script src="/app.js"></script>','')
 page.set_content(html)
 page.add_style_tag(content=(ROOT/'public/style.css').read_text(encoding='utf8'))
 page.add_script_tag(content=(ROOT/'public/timeline.js').read_text(encoding='utf8'))
 page.add_script_tag(content=(ROOT/'public/draw.js').read_text(encoding='utf8'))
 page.evaluate('''() => {
 window.open = () => null;
 const id='11111111-2222-4333-8444-555555555555';
 window.__testVideos=[];
 window.fetch=async (url,opts={})=>{
   const method=opts.method||'GET',data=opts.body?JSON.parse(opts.body):{};
   let result={},status=200;
   if(url==='/api/login')result={ok:true};
   else if(url==='/api/videos' && method==='GET')result={videos:window.__testVideos};
   else if(url==='/api/videos' && method==='POST'){
      const title=data.title,scenes=['Başlangıç','Tehlike','Karar'].map((caption,i)=>({caption,narration:caption,detail:'',shot:'wide',weight:1}));
      const video={...data,title,id,scenes,render_status:'pending',storyboard_approved:false,created_at:new Date().toISOString(),scheduled_at:null,duration:data.duration||18};
      window.__testVideos.unshift(video);result={video};status=201;
   }
   else if(url.includes('/approve')){window.__testVideos[0].storyboard_approved=true;result={ok:true};}
   else if(method==='PATCH'){Object.assign(window.__testVideos[0],data,{storyboard_approved:false});result={video:window.__testVideos[0]};}
   else result={ok:true};
   return new Response(JSON.stringify(result),{status,headers:{'Content-Type':'application/json'}});
 };
}''')
 page.add_script_tag(content=(ROOT/'public/app.js').read_text(encoding='utf8'))
 page.locator('#workspace').wait_for(state='visible')
 page.locator('#newVideo').click()
 page.locator('#title').fill('Karanlık bina ve son çıkış')
 page.locator('#script').fill('Bir anda bütün ışıklar söndü. Şimdi ne yapacağız?')
 page.locator('#createForm button[type=submit]').click()
 page.locator('[data-action="storyboard"]').first.click()
 page.locator('#storyboardDialog').wait_for(state='visible')
 assert page.locator('.storyboard-card').count()==3
 page.locator('.storyboard-card').first.locator('[data-field="caption"]').fill('KAPI KAPANDI')
 page.locator('.storyboard-card').first.locator('[data-field="shot"]').select_option('close')
 page.locator('#storyboardFps').select_option('24')
 page.screenshot(path='/mnt/data/Video_Studio_v03_Storyboard.png',full_page=True)
 page.locator('#approveStoryboard').click()
 page.locator('#storyboardDialog').wait_for(state='hidden')
 assert 'Storyboard ✓' in page.locator('[data-action="storyboard"]').first.inner_text()
 page.locator('#importVideo').click()
 plan={'title':'Claude Free senaryo denemesi','style':'whatif','duration':20,'scenes':[
  {'caption':'İlk çarpıcı an','narration':'Bu sabah her şey değişti.','detail':'Yakın çekim','shot':'close','weight':2},
  {'caption':'İkinci sahne','narration':'Kimse bu sonucu beklemiyordu.','detail':'Geniş açı','shot':'wide','weight':1}]}
 import json
 page.locator('#importJSON').fill(json.dumps(plan,ensure_ascii=False))
 page.locator('#importForm button[type=submit]').click()
 page.locator('#storyboardDialog').wait_for(state='visible')
 assert page.locator('.storyboard-card').count()==2
 assert page.locator('.storyboard-card').first.locator('[data-field="caption"]').input_value()=='İlk çarpıcı an'
 assert not errors,errors
 page.screenshot(path='/mnt/data/Video_Studio_v03_Panel.png',full_page=True)
 browser.close()
print('UI PASS: gerçek frontend HTML/Canvas, storyboard açma, düzenleme, onay ve 24 FPS (API mock)')
