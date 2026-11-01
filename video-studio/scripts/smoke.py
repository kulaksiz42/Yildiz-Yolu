#!/usr/bin/env python3
"""Starts app locally, authenticates, creates a video, renders MP4, verifies it with ffprobe."""
import os,sys,json,subprocess,time,urllib.request,urllib.error,signal
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PORT=42813
url=f'http://127.0.0.1:{PORT}'
password='local-test-only-not-for-deploy'
env={**os.environ,'STUDIO_PASSWORD':password,'STUDIO_PORT':str(PORT),'STUDIO_HOST':'127.0.0.1','BROWSER_BIN':os.environ.get('BROWSER_BIN','/usr/bin/chromium')}
server=subprocess.Popen(['node','server.mjs'],cwd=ROOT,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
try:
    for _ in range(50):
        try:
            json.load(urllib.request.urlopen(url+'/health',timeout=.5));break
        except Exception:time.sleep(.1)
    else:raise RuntimeError('Server did not start')
    # Login page must be public, protected API must reject anonymous callers.
    assert b'Video Studio' in urllib.request.urlopen(url+'/', timeout=3).read()
    try:
        urllib.request.urlopen(url+'/api/videos', timeout=3)
        raise AssertionError('Private API was exposed without a session')
    except urllib.error.HTTPError as err:
        assert err.code == 401
    opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor())
    def req(p,body=None,method=None):
        data=None if body is None else json.dumps(body).encode()
        r=urllib.request.Request(url+p,data=data,method=method or ('POST' if body is not None else 'GET'),headers={'Content-Type':'application/json'})
        return json.load(opener.open(r,timeout=15))
    assert req('/api/login',{'password':password})['ok']
    video=req('/api/videos',{'title':'Ya elektrikler kesilirse','style':'whatif','duration':8,'script':'Elektrikler gitti. Şimdi ne yapacağız?'})['video']
    assert video['render_status']=='pending'
    # Explicit storyboard approval gate: render without approval must fail.
    try:
        req('/api/videos/'+video['id']+'/render',{},'POST')
        raise AssertionError('Storyboard gate bypassed')
    except urllib.error.HTTPError as err: assert err.code==409
    if os.environ.get('STUDIO_SMOKE_HIGH_RES')=='1':
        patch=req('/api/videos/'+video['id'],{'render_fps':24,'render_size':1080},'PATCH')['video']
        assert patch['render_fps']==24 and patch['render_size']==1080
    assert req('/api/videos/'+video['id']+'/approve',{},'POST')['ok']
    assert req('/api/videos/'+video['id']+'/render',{},'POST')['ok']
    deadline=time.monotonic()+150
    while time.monotonic()<deadline:
        items=req('/api/videos')['videos'];state=next(x for x in items if x['id']==video['id'])
        if state['render_status'] in ('ready','error'):break
        time.sleep(1.5)
    assert state['render_status']=='ready',str(state.get('error'))
    file=ROOT/'output'/f"{video['id']}.mp4"
    assert file.exists() and file.stat().st_size>10_000
    info=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-print_format','json','-show_streams',str(file)]))
    assert any(s.get('codec_type')=='video' for s in info['streams'])
    timeline=json.loads((ROOT/'output'/f"{video['id']}.timeline.json").read_text())
    quality=json.loads((ROOT/'output'/f"{video['id']}.quality.json").read_text())
    assert timeline['source']=='estimated' and timeline['scenes']
    if os.environ.get('STUDIO_SMOKE_HIGH_RES')=='1':
        stream=next(s for s in info['streams'] if s.get('codec_type')=='video')
        assert (stream['width'],stream['height'])==(1080,1920)
        assert stream['avg_frame_rate'].startswith('24/')
    assert quality['status']=='pass',quality
    assert quality['editorial_heuristics'] and len(quality['editorial_heuristics'])==len(video['scenes'])
    assert (ROOT/'output'/f"{video['id']}.contact.jpg").exists()
    assert req('/api/videos/'+video['id']+'/timeline')['duration'] >= 8
    assert req('/api/videos/'+video['id']+'/quality')['status']=='pass'
    assert opener.open(url+'/api/videos/'+video['id']+'/contact').headers.get('Content-Type')=='image/jpeg'
    print('SMOKE PASS:',file, 'bytes',file.stat().st_size)
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
