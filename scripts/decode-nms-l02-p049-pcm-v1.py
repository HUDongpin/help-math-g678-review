from pathlib import Path
import json,hashlib,subprocess,array,math
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p049/audit';source=json.loads((A/'source-audio-streams-v1.json').read_text());assert source['sourceSha256']=='896e38a05c5e6392f7e9284aa278a5b7e10c13b15f7911fa09d1dc9b1de865b2'
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
rows=[]
for stream in source['streams']:
 inp=R/stream['encodedStream']['path'];assert pin(inp)==stream['encodedStream'];out=A/(stream['domain']+'-source-pcm-v1.f32le')
 probe=json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe','-v','error','-select_streams','a:0','-show_entries','stream=codec_name,sample_rate,channels','-of','json',str(inp)]))['streams'][0];assert probe['codec_name']=='mp3' and probe['sample_rate']=='22050'and probe['channels']==1
 if not out.exists():subprocess.run(['/opt/homebrew/bin/ffmpeg','-v','error','-nostdin','-n','-i',str(inp),'-map','0:a:0','-c:a','pcm_f32le','-f','f32le',str(out)],check=True)
 data=out.read_bytes();assert len(data)>0 and len(data)%4==0;samples=array.array('f');samples.frombytes(data);assert all(math.isfinite(x)for x in samples)
 rows.append({'domain':stream['domain'],'source':pin(inp),'pcm':pin(out),'format':'f32le','sampleRate':22050,'channels':1,'samples':len(samples),'seconds':len(samples)/22050,'peak':max(map(abs,samples)),'rms':math.sqrt(sum(x*x for x in samples)/len(samples))})
result={'sourceSha256':source['sourceSha256'],'streams':rows,'decoder':pin(Path('/opt/homebrew/bin/ffmpeg').resolve()),'probe':pin(Path('/opt/homebrew/bin/ffprobe').resolve()),'policy':'Decode each full original MP3 stream without cutting encoded bytes or forced resampling; frame scheduling remains separate.','audioAccepted':False,'originalRuntimeAccepted':False};p=A/'source-pcm-inventory-v1.json';text=json.dumps(result,indent=2)+'\n'
if p.exists():assert p.read_text()==text
else:p.write_text(text)
print(json.dumps([{'domain':x['domain'],'samples':x['samples'],'seconds':x['seconds']}for x in rows]))
