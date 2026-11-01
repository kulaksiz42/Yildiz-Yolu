import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { makeStory, cleanUpdate, safeId, STYLE_NAMES } from './scripts/story.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC=path.join(ROOT,'public');
const DATA=path.join(ROOT,'data');
const OUT=path.join(ROOT,'output');
const HOST=process.env.STUDIO_HOST || '127.0.0.1';
const PORT=Number(process.env.STUDIO_PORT || 4173);
const PASSWORD=process.env.STUDIO_PASSWORD;
if (!PASSWORD || PASSWORD.length < 10 || PASSWORD.startsWith('CHANGE_ME')) {
  console.error('STUDIO_PASSWORD en az 10 karakter olarak ayarlanmalı; varsayılan şifre kullanılmaz.'); process.exit(1);
}
fs.mkdirSync(DATA,{recursive:true});fs.mkdirSync(OUT,{recursive:true});
const DB=path.join(DATA,'videos.json');
if(!fs.existsSync(DB)) fs.writeFileSync(DB,'[]\n');
const AUTH_KEY=crypto.randomBytes(32);
const INTERNAL_KEY=crypto.randomBytes(24).toString('hex');
const LOGIN_WINDOW=new Map();
const running=new Set();
let videos = JSON.parse(fs.readFileSync(DB,'utf8'));
const save=()=>{ const tmp=DB+'.tmp';fs.writeFileSync(tmp,JSON.stringify(videos,null,2));fs.renameSync(tmp,DB); };
const json=(res,status,obj)=>respond(res,status,JSON.stringify(obj),{'Content-Type':'application/json; charset=utf-8'});
function respond(res,status,body,headers={}) { res.writeHead(status,{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'",...headers});res.end(body); }
function cookie(req,name){return (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);}
function signed(value) {return crypto.createHmac('sha256',AUTH_KEY).update(value).digest('hex');}
function authed(req) {
  const session=cookie(req,'studio_session'); if(!session)return false;
  const [until,mac]=session.split('.');if(!until||!mac||!/^[0-9a-f]{64}$/.test(mac))return false;
  if(Number(until)<Date.now() || Number(until)>Date.now()+24*3600_000) return false;
  return crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(signed(until)));
}
const safeStatic = (res,name) => {
  const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/app.js','app.js'],['/style.css','style.css'],['/draw.js','draw.js'],['/preview.js','preview.js'],['/preview.html','preview.html'],]);
  if(!allowed.has(name))return json(res,404,{error:'Bulunamadı'});
  const target=path.join(PUBLIC,allowed.get(name));
  const ext=path.extname(target);
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
  respond(res,200,fs.readFileSync(target),{'Content-Type':mime[ext]});
};
async function body(req) {
  let buf='';for await(const chunk of req){buf+=chunk;if(buf.length>60_000)throw Error('İstek çok büyük.');}
  try{return JSON.parse(buf||'{}');}catch{throw Error('JSON okunamadı.');}
}
function validOrigin(req){const origin=req.headers.origin;if(!origin)return true;try{const url=new URL(origin);return url.host===req.headers.host;}catch{return false;}}
function renderStory(id) {
  if(running.has(id)) throw Error('Bu video zaten işleniyor.');
  const item=videos.find(x=>x.id===id);
  if(!item)throw Error('Video bulunamadı.');
  if(item.render_status==='rendering')throw Error('Video zaten render ediliyor.');
  item.render_status='rendering';item.error=null;save();running.add(id);
  const child=spawn(process.env.PYTHON_BIN||'python3',['scripts/render.py','--id',id,'--port',String(PORT)],{
    cwd:ROOT,env:{...process.env,STUDIO_RENDER_TOKEN:INTERNAL_KEY},stdio:['ignore','pipe','pipe']
  });
  let detail='';
  for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{detail=(detail+chunk.toString()).slice(-8000);});
  child.on('error',err=>{item.render_status='error';item.error=String(err);running.delete(id);save();});
  child.on('close',code=>{
    running.delete(id);
    if(code===0 && fs.existsSync(path.join(OUT,id+'.mp4'))){item.render_status='ready';item.file=id+'.mp4';item.error=null;}
    else{item.render_status='error';item.error=(detail||'Render başarısız').slice(-700);}
    save();
    console.log(`[render] ${id} status=${item.render_status}`);
  });
}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  const p=url.pathname;
  if(req.method==='GET'&&p==='/health')return json(res,200,{ok:true,version:'0.1.0'});
  if(req.method==='POST'&&!validOrigin(req))return json(res,403,{error:'Origin reddedildi.'});
  if(req.method==='POST'&&p==='/api/login'){
    try{
      const ip=req.socket.remoteAddress||'?';const a=LOGIN_WINDOW.get(ip)||{count:0,until:0};
      if(Date.now()<a.until)return json(res,429,{error:'Çok fazla giriş denemesi. Daha sonra deneyin.'});
      const payload=await body(req);
      const supplied=crypto.createHash('sha256').update(String(payload.password||'')).digest();
      const expected=crypto.createHash('sha256').update(PASSWORD).digest();
      if(!crypto.timingSafeEqual(supplied,expected)){
        a.count++;if(a.count>=5){a.until=Date.now()+5*60_000;a.count=0;}LOGIN_WINDOW.set(ip,a);
        return json(res,401,{error:'Şifre hatalı.'});
      }
      LOGIN_WINDOW.delete(ip);
      const until=String(Date.now()+12*3600_000);
      const secure=process.env.STUDIO_SECURE_COOKIE==='1'?'; Secure':'';
      res.setHeader('Set-Cookie',`studio_session=${until}.${signed(until)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=43200${secure}`);
      return json(res,200,{ok:true});
    }catch(e){return json(res,400,{error:e.message});}
  }
  // Auth for all content, including previews and MP4. Only renderer receives a short-lived private server key.
  const internal=(p==='/api/render-data') && url.searchParams.get('key')===INTERNAL_KEY && req.socket.remoteAddress?.includes('127.0.0.1');
  // The login page, stylesheet and login JavaScript must be readable before authentication.
  if(!authed(req)&&!internal&&!['/','/index.html','/app.js','/style.css','/draw.js'].includes(p))return json(res,401,{error:'Giriş gerekli.'});
  if(req.method==='POST'&&p==='/api/logout'){
    res.setHeader('Set-Cookie','studio_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');return json(res,200,{ok:true});
  }
  if(req.method==='GET'&&p==='/api/videos')return json(res,200,{videos});
  if(req.method==='GET'&&p==='/api/styles')return json(res,200,{styles:STYLE_NAMES});
  if(req.method==='POST'&&p==='/api/videos'){
    try{const item=makeStory(await body(req));videos.unshift(item);save();return json(res,201,{video:item});}
    catch(e){return json(res,400,{error:e.message});}
  }
  if(req.method==='GET'&&p==='/api/render-data'){
    const id=url.searchParams.get('id');const item=videos.find(v=>v.id===id);
    return item?json(res,200,{video:item}):json(res,404,{error:'Bulunamadı'});
  }
  const m=p.match(/^\/api\/videos\/([\w-]{36})(?:\/(render|file))?$/);
  if(m && safeId(m[1])){
    const id=m[1],item=videos.find(v=>v.id===id);if(!item)return json(res,404,{error:'Video bulunamadı.'});
    if(req.method==='PATCH'&&!m[2]){
      if(item.render_status==='rendering')return json(res,409,{error:'Render sırasında düzenlenemez.'});
      try{const changed=cleanUpdate(item,await body(req));Object.assign(item,changed);item.render_status='pending';item.file=null;save();return json(res,200,{video:item});}
      catch(e){return json(res,400,{error:e.message});}
    }
    if(req.method==='POST'&&m[2]==='render'){
      try{renderStory(id);return json(res,202,{ok:true,message:'Render başlatıldı.'});}
      catch(e){return json(res,409,{error:e.message});}
    }
    if(req.method==='GET'&&m[2]==='file'){
      if(item.render_status!=='ready'||!item.file)return json(res,404,{error:'Dosya hazır değil.'});
      const filepath=path.join(OUT,id+'.mp4');if(!fs.existsSync(filepath))return json(res,404,{error:'Dosya bulunamadı.'});
      const stat=fs.statSync(filepath);
      res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':stat.size,'Content-Disposition':`inline; filename="${id}.mp4"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
      return fs.createReadStream(filepath).pipe(res);
    }
  }
  if(req.method==='GET'&&['/','/index.html','/app.js','/draw.js','/preview.js','/style.css','/preview.html'].includes(p))return safeStatic(res,p);
  return json(res,404,{error:'Yol bulunamadı.'});
});
server.listen(PORT,HOST,()=>console.log(`Video Studio: http://${HOST}:${PORT} (şifre korumalı, yayın API'leri kapalı)`));
