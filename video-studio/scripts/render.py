#!/usr/bin/env python3
"""Deterministic canvas -> PNG frames (Playwright) -> MP4 (FFmpeg).
Local voice uses espeak; optional ElevenLabs TTS with credentials in environment.
Never publishes to any social network.
"""
from __future__ import annotations
import argparse
import base64
import re
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output"


def command(args, **kw):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kw)


def probe_duration(filename: Path) -> float:
    try:
        data = command(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(filename)]).stdout
        return float(data.strip())
    except (ValueError, subprocess.CalledProcessError):
        return 0.0


def word_alignment(text: str, payload: dict):
    """Convert ElevenLabs original-text character timing to word spans; reject mismatches."""
    alignment = payload.get("alignment") or {}
    chars = alignment.get("characters") or []
    starts = alignment.get("character_start_times_seconds") or []
    ends = alignment.get("character_end_times_seconds") or []
    if len(chars) != len(starts) or len(chars) != len(ends) or "".join(chars) != text:
        return None
    words = []
    for match in re.finditer(r"[\w]+(?:[’\x27-][\w]+)*", text, flags=re.UNICODE):
        i,j=match.span()
        words.append({"text":match.group(),"start":float(starts[i]),"end":float(ends[j-1])})
    return words

def tts(text: str, folder: Path):
    """Produce voice.wav. ElevenLabs if configured; espeak fallback; never logs credentials."""
    voice = folder / "voice.wav"
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "")
    if api_key and voice_id:
        url = "https://api.elevenlabs.io/v1/text-to-speech/" + voice_id + "/with-timestamps"
        body = json.dumps({"text":text, "model_id":"eleven_multilingual_v2", "voice_settings":{"stability":0.55,"similarity_boost":0.75}}).encode()
        req = urllib.request.Request(url, data=body, headers={"xi-api-key":api_key,"Content-Type":"application/json", "Accept":"application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as response:
                result = json.load(response)
            audio = folder / "elevenlabs.mp3"
            audio.write_bytes(base64.b64decode(result["audio_base64"],validate=True))
            command(["ffmpeg", "-y", "-v", "error", "-i", str(audio), "-ar", "44100", "-ac", "1", str(voice)])
            return voice, "elevenlabs", word_alignment(text,result)
        except (urllib.error.URLError, subprocess.CalledProcessError) as exc:
            raise RuntimeError("ElevenLabs seslendirme başarısız. Anahtar, limit ve ses kimliğini kontrol et.") from exc
    if shutil.which("espeak"):
        command(["espeak", "-v", "tr", "-s", "170", "-w", str(voice), text])
        return voice, "espeak", None
    return None, "silent", None


def make_video(story: dict, port: int, token: str, fps: int = 12, browser_bin: str | None = None, size: int = 540):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright bulunamadı. Yükle: python3 -m pip install playwright") from exc
    OUT.mkdir(exist_ok=True, parents=True)
    video_id = story['id']
    with tempfile.TemporaryDirectory(prefix="kulaksiz-video-") as tmp:
        work = Path(tmp)
        voice, voice_engine, word_timings = tts(story['script'], work)
        audio_length = probe_duration(voice) if voice else 0
        duration = min(95, max(8, float(story['duration']), audio_length + 0.35))
        frames = round(fps * duration)
        # User story may be longer than originally requested; protect against cutting off the narration.
        if voice and audio_length > 95:
            raise RuntimeError("Seslendirme 95 saniyeden uzun; metni kısalt.")
        preview_story = {**story,"duration":duration}
        # Browser navigation may be restricted in CI. Inject local canvas engine directly,
        # avoiding network requests and keeping all video content inside the process.
        print(f"Render: {video_id} | {fps}fps x {duration:.1f}s | voice={voice_engine}", flush=True)
        with sync_playwright() as p:
            options = {"headless":True, "args":["--no-sandbox", "--disable-dev-shm-usage"]}
            if browser_bin: options["executable_path"]=browser_bin
            browser=p.chromium.launch(**options)
            page=browser.new_page(viewport={"width":540,"height":960},device_scale_factor=1)
            page.set_content('<html><body style="margin:0"><canvas id="screen" width="540" height="960"></canvas></body></html>')
            page.add_script_tag(content=(ROOT / 'public' / 'timeline.js').read_text(encoding='utf-8'))
            page.add_script_tag(content=(ROOT / 'public' / 'draw.js').read_text(encoding='utf-8'))
            built_timeline = page.evaluate("args => window.StudioTimeline.build(args.story,{duration:args.duration,wordTimings:args.words})", {'story':preview_story,'duration':duration,'words':word_timings})
            preview_story['timeline']=built_timeline
            (OUT/(video_id+'.timeline.json')).write_text(json.dumps(built_timeline,ensure_ascii=False,indent=2),encoding='utf8')
            page.evaluate("story => window.videoData = story", preview_story)
            # Renderer is synchronous. Capture exact timeline, not real-time; reproducible frames.
            frame_paths=[]
            for i in range(frames):
                page.evaluate("seconds => StudioDraw.render(document.getElementById('screen'), window.videoData, seconds)", i/fps)
                filename=work/f"frame_{i:05d}.png"
                page.locator("#screen").screenshot(path=str(filename),timeout=30000)
                frame_paths.append(filename)
                if i and i % max(1,int(fps*5))==0:
                    print(f"  {i}/{frames} kare", flush=True)
            # Render an arbitrary sample twice; exact repeatability is the seek(t) contract.
            probe_t=min(duration-.001,max(0,duration*.35))
            page.evaluate("seconds => StudioDraw.render(document.getElementById('screen'), window.videoData, seconds)",probe_t)
            hash_a=hashlib.sha256(page.locator('#screen').screenshot()).digest()
            page.evaluate("seconds => StudioDraw.render(document.getElementById('screen'), window.videoData, seconds)",probe_t)
            hash_b=hashlib.sha256(page.locator('#screen').screenshot()).digest()
            deterministic=hash_a==hash_b
            browser.close()
        target=OUT/(video_id+'.mp4')
        temp_mp4=OUT/(video_id+'.partial.mp4')
        ff=["ffmpeg","-y","-hide_banner","-loglevel","error","-framerate",str(fps),"-i",str(work/'frame_%05d.png')]
        if voice:
            ff += ["-i",str(voice),"-filter:a","apad"]
        if size==1080: ff += ["-vf","scale=1080:1920:flags=lanczos"]  # upscale from 540x960 Canvas
        ff += ["-c:v","libx264","-preset","veryfast","-crf","24","-pix_fmt","yuv420p","-r",str(fps),"-movflags","+faststart"]
        if voice:ff += ["-c:a","aac","-b:a","128k"]
        ff += ["-t",str(duration),str(temp_mp4)]
        command(ff)
        if temp_mp4.stat().st_size<10000: raise RuntimeError('MP4 beklenenden küçük.')
        temp_mp4.replace(target)
        # Technical QA generates a contact sheet + report; visual aesthetics still need review.
        from quality import check_video
        quality=check_video(target,duration,fps,voice is not None,frame_paths,work,OUT,video_id,
                            deterministic,built_timeline['source'],output_width=size,storyboard=story.get('scenes',[]),shot_timeline=built_timeline['scenes'])
        (OUT/(video_id+'.json')).write_text(json.dumps({"duration":duration,"fps":fps,"voice_engine":voice_engine,
            "word_alignment":built_timeline['source'],"quality_status":quality['status'],"file":target.name},ensure_ascii=False,indent=2),encoding='utf8')
        print(f"OK: {target} ({target.stat().st_size} bytes)", flush=True)
        return target


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--id',required=True)
    parser.add_argument('--port',type=int,default=4173)
    parser.add_argument('--fps',type=int,default=12)
    parser.add_argument('--size',type=int,default=540)
    args=parser.parse_args()
    if args.fps not in (12,24,30):raise RuntimeError('FPS 12,24,30 olmalı.')
    if args.size not in (540,1080):raise RuntimeError('Boyut 540 veya 1080 olmalı.')
    token=os.environ.get('STUDIO_RENDER_TOKEN')
    if not token:raise RuntimeError('STUDIO_RENDER_TOKEN sunucu tarafından verilmedi.')
    url=f'http://127.0.0.1:{args.port}/api/render-data?id={args.id}&key={token}'
    with urllib.request.urlopen(url,timeout=10) as resp: story=json.load(resp)['video']
    make_video(story,args.port,token,args.fps,os.environ.get('BROWSER_BIN'),args.size)

if __name__=='__main__':
    try:main()
    except Exception as e:
        print('RENDER ERROR:',str(e),file=sys.stderr)
        sys.exit(1)
