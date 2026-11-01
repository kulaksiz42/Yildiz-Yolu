#!/usr/bin/env python3
"""Deterministic canvas -> PNG frames (Playwright) -> MP4 (FFmpeg).
Local voice uses espeak; optional ElevenLabs TTS with credentials in environment.
Never publishes to any social network.
"""
from __future__ import annotations
import argparse
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


def tts(text: str, folder: Path):
    """Produce voice.wav. ElevenLabs if configured; espeak fallback; never logs credentials."""
    voice = folder / "voice.wav"
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "")
    if api_key and voice_id:
        url = "https://api.elevenlabs.io/v1/text-to-speech/" + voice_id
        body = json.dumps({"text":text, "model_id":"eleven_multilingual_v2", "voice_settings":{"stability":0.55,"similarity_boost":0.75}}).encode()
        req = urllib.request.Request(url, data=body, headers={"xi-api-key":api_key,"Content-Type":"application/json", "Accept":"audio/mpeg"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                audio = folder / "elevenlabs.mp3"
                audio.write_bytes(response.read())
            command(["ffmpeg", "-y", "-v", "error", "-i", str(audio), "-ar", "44100", "-ac", "1", str(voice)])
            return voice, "elevenlabs"
        except (urllib.error.URLError, subprocess.CalledProcessError) as exc:
            raise RuntimeError("ElevenLabs seslendirme başarısız. Anahtar, limit ve ses kimliğini kontrol et.") from exc
    if shutil.which("espeak"):
        command(["espeak", "-v", "tr", "-s", "170", "-w", str(voice), text])
        return voice, "espeak"
    return None, "silent"


def make_video(story: dict, port: int, token: str, fps: int = 12, browser_bin: str | None = None):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError("Playwright bulunamadı. Yükle: python3 -m pip install playwright") from exc
    OUT.mkdir(exist_ok=True, parents=True)
    video_id = story['id']
    with tempfile.TemporaryDirectory(prefix="kulaksiz-video-") as tmp:
        work = Path(tmp)
        voice, voice_engine = tts(story['script'], work)
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
            page.add_script_tag(content=(ROOT / 'public' / 'draw.js').read_text(encoding='utf-8'))
            page.evaluate("story => window.videoData = story", preview_story)
            # Renderer is synchronous. Capture exact timeline, not real-time; reproducible frames.
            for i in range(frames):
                page.evaluate("seconds => StudioDraw.render(document.getElementById('screen'), window.videoData, seconds)", i/fps)
                page.locator("#screen").screenshot(path=str(work/f"frame_{i:05d}.png"),timeout=30000)
                if i and i % max(1,int(fps*5))==0:
                    print(f"  {i}/{frames} kare", flush=True)
            browser.close()
        target=OUT/(video_id+'.mp4')
        temp_mp4=OUT/(video_id+'.partial.mp4')
        ff=["ffmpeg","-y","-hide_banner","-loglevel","error","-framerate",str(fps),"-i",str(work/'frame_%05d.png')]
        if voice:
            ff += ["-i",str(voice),"-filter:a","apad"]
        ff += ["-c:v","libx264","-preset","veryfast","-crf","24","-pix_fmt","yuv420p","-r",str(fps),"-movflags","+faststart"]
        if voice:ff += ["-c:a","aac","-b:a","128k"]
        ff += ["-t",str(duration),str(temp_mp4)]
        command(ff)
        if temp_mp4.stat().st_size<10000: raise RuntimeError('MP4 beklenenden küçük.')
        temp_mp4.replace(target)
        (OUT/(video_id+'.json')).write_text(json.dumps({"duration":duration,"fps":fps,"voice_engine":voice_engine,"file":target.name},ensure_ascii=False,indent=2),encoding='utf8')
        print(f"OK: {target} ({target.stat().st_size} bytes)", flush=True)
        return target


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--id',required=True)
    parser.add_argument('--port',type=int,default=4173)
    parser.add_argument('--fps',type=int,default=12)
    args=parser.parse_args()
    if not 3<=args.fps<=30:raise RuntimeError('FPS 3..30 olmalı.')
    token=os.environ.get('STUDIO_RENDER_TOKEN')
    if not token:raise RuntimeError('STUDIO_RENDER_TOKEN sunucu tarafından verilmedi.')
    url=f'http://127.0.0.1:{args.port}/api/render-data?id={args.id}&key={token}'
    with urllib.request.urlopen(url,timeout=10) as resp: story=json.load(resp)['video']
    make_video(story,args.port,token,args.fps,os.environ.get('BROWSER_BIN'))

if __name__=='__main__':
    try:main()
    except Exception as e:
        print('RENDER ERROR:',str(e),file=sys.stderr)
        sys.exit(1)
