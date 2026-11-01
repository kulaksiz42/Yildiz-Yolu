#!/usr/bin/env python3
"""Technical post-render checks and a contact sheet. No false 'AI approval' claims."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import subprocess


def video_probe(file: Path):
    p=subprocess.run(['ffprobe','-v','error','-of','json','-show_streams','-show_format',str(file)],capture_output=True,text=True,check=True)
    return json.loads(p.stdout)


def check_video(file: Path, duration:float, fps:int, expect_audio:bool, frames:list[Path],
                work:Path, output_dir:Path, id:str, deterministic:bool|None=None,
                alignment_source:str='estimated', output_width:int=540, storyboard:list|None=None, shot_timeline:list|None=None):
    from PIL import Image, ImageStat, ImageOps, ImageDraw
    output_dir.mkdir(parents=True,exist_ok=True)
    results=[]
    def record(name,ok,detail,severity='error'):
        results.append({'check':name,'status':'pass' if ok else 'fail','severity':'info' if ok else severity,'detail':detail})
    p=video_probe(file)
    v=next((s for s in p.get('streams',[]) if s.get('codec_type')=='video'),None)
    a=next((s for s in p.get('streams',[]) if s.get('codec_type')=='audio'),None)
    record('video_stream',bool(v),'H.264 video akışı bulundu' if v else 'Video akışı eksik')
    if v:
        record('portrait_dimensions',v.get('width')==output_width and v.get('height')==int(output_width*16/9),f"{v.get('width')}×{v.get('height')} çıktı (beklenen: {output_width}×{int(output_width*16/9)})")
        record('codec',v.get('codec_name')=='h264',f"Codec: {v.get('codec_name')}")
    record('audio_stream',not expect_audio or bool(a),'Ses akışı mevcut' if a else ('Ses bekleniyordu, bulunamadı' if expect_audio else 'Sessiz çıktı; TTS kurulu değil'), 'warning')
    actual=float(p.get('format',{}).get('duration',0))
    record('duration',abs(actual-duration)<0.5,f'Beklenen {duration:.2f}s, gerçekleşen {actual:.2f}s')
    record('frame_count',len(frames)>=max(1,int(duration*fps)-1),f'{len(frames)} PNG kare')
    if deterministic is not None:
        record('seek_determinism',deterministic,'Aynı zaman damgasındaki iki karenin SHA-256 değeri '+('eşit' if deterministic else 'farklı'))
    # Sample at most 18 frames to keep memory and processing bounded.
    stride=max(1,len(frames)//18)
    selected=frames[::stride][:18]
    tiles=[]; suspicious=[]; hashes=[]
    for frame in selected:
        with Image.open(frame) as img:
            rgb=img.convert('RGB')
            thumb=ImageOps.contain(rgb,(180,320))
            stats=ImageStat.Stat(rgb.resize((54,96)).convert('L'))
            if stats.stddev[0]<2.2: suspicious.append(frame.name)
            hashes.append(hashlib.sha256(rgb.tobytes()).hexdigest())
            tiles.append(thumb.copy())
    record('blank_frame_scan',not suspicious,f'{len(selected)} örnek kare; düşük kontrastlı: {suspicious[:4]}','warning')
    unique=len(set(hashes))
    record('sample_diversity',unique>1 or len(hashes)<2,f'{unique}/{len(hashes)} farklı örnek kare', 'warning')
    columns=6; rows=(len(tiles)+columns-1)//columns
    contact=Image.new('RGB',(columns*180,rows*345),(21,25,37));pen=ImageDraw.Draw(contact)
    for idx,img in enumerate(tiles):
        x=(idx%columns)*180;y=(idx//columns)*345
        contact.paste(img,(x,y))
        source_idx=idx*stride
        pen.text((x+8,y+322),f'{source_idx/max(1,fps):05.2f}s',fill=(240,240,240))
    photo=output_dir/f'{id}.contact.jpg';contact.save(photo,'JPEG',quality=84)
    # Heuristic editorial review: clear, actionable, transparent about non-AI limitations.
    editorial=[]
    for i,scene in enumerate(storyboard or []):
        ts=(shot_timeline or [])
        span=(ts[i]['end']-ts[i]['start']) if i<len(ts) else 0
        caption=str(scene.get('caption') or '')
        speech=str(scene.get('narration') or caption)
        advice=[]
        if len(caption)>70: advice.append('Başlığı telefonda okumak zor olabilir; 70 karakterin altına indir.')
        if span>9: advice.append(f'Sahne {span:.1f}s sürüyor; ritmi artırmak için bir ara geçiş düşün.')
        if span<1.2: advice.append('Sahne çok kısa; okuma ve algılama süresi yetersiz olabilir.')
        if len(speech.split())/max(span,.1)>3.1: advice.append('Konuşma hızı tahmini olarak çok yüksek; cümleyi kısalt veya sahneyi uzat.')
        if i>0 and scene.get('shot','wide')==(storyboard or [])[i-1].get('shot','wide'):
            advice.append('Önceki sahneyle aynı kamera planı; varyasyon düşünebilirsin.')
        editorial.append({'scene':i+1,'start':round(ts[i]['start'],2) if i<len(ts) else None,
                          'end':round(ts[i]['end'],2) if i<len(ts) else None,
                          'flags':advice,'review':'check' if advice else 'no_heuristic_flags'})
    issues=[x for x in results if x['status']=='fail']
    report={'version':1,'video_id':id,'duration':actual,'fps':fps,'word_alignment':alignment_source,
            'alignment_note':'Word timings are measured by ElevenLabs' if alignment_source=='elevenlabs' else 'Word timings are estimated, NOT verified against speech',
            'checks':results,'status':'review' if issues else 'pass','contact_sheet':photo.name,
            'human_review_required':True,'editorial_heuristics':editorial,'render_mode':'upscaled_540_to_1080' if output_width==1080 else 'native_540','limitations':['No automatic AI aesthetic scoring','No phonetic verification for estimated word timings','Sound quality must be listened to']}
    target=output_dir/f'{id}.quality.json';target.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    return report
