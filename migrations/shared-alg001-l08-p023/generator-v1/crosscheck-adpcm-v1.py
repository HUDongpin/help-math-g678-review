from pathlib import Path
import json,struct,hashlib,datetime,sys
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p23a1/source-extraction-v1');source=json.loads((M/'native-v1/adpcm-source-v1.json').read_text());failed=json.loads((M/'audit-v1/adpcm-independent-decode-v1.json').read_text());ours=(M/'source-v1/stream-102.wav').read_bytes();other=(D/'adpcm-102-ffmpeg-v1.pcm').read_bytes();sha=lambda b:hashlib.sha256(b).hexdigest()
assert source['binaryXmlEquivalent']and source['head']['sampleSize']=='459'and len(source['blocks'])==13
assert not failed['pass']and failed['oursPcmSha256']==sha(ours[44:])and failed['ffmpegPcmSha256']==sha(other)
assert ours[36:40]==b'data'and len(ours[44:])==13*459*2 and len(other)==13*460*2
rows=[]
for i,b in enumerate(source['blocks']):
 raw=bytes.fromhex(b['hex']);assert raw[0]>>6==3 and raw[-1]&63==0 #5-bit samples and six zero trailing padding bits.
 assert b['sampleCountPerChannel']==459 and b['frame']==i+1
 a=ours[44+i*918:44+(i+1)*918];c=other[i*920:i*920+918];assert a==c
 rows.append(dict(frame=b['frame'],originalBlockSha256=sha(raw),declaredSamples=459,equalPcmBytes=918,equalPcmSha256=sha(a),ffmpegExtraPaddingSample=struct.unpack('<h',other[i*920+918:i*920+920])[0],paddingBits=6,paddingValue=0))
def pin(p):b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
result=dict(pass_=True,sourceSwfSha256=source['sourceSwfSha256'],spriteId=102,sourceDeclaredSampleCount=5967,fullFfmpegOutputSampleCount=5980,declaredPcmBytesEqual=11934,rows=rows,sourceModel=pin(M/'native-v1/adpcm-source-v1.json'),wav=pin(M/'source-v1/stream-102.wav'),ffmpegPcm=pin(D/'adpcm-102-ffmpeg-v1.pcm'),sourceWrapper=pin(D/'adpcm-102-audio-only-source-wrapper-v1.swf'),retainedWholeOutputMismatch=pin(M/'audit-v1/adpcm-independent-decode-v1.json'),interpretation='The original SoundStreamHead declares459 samples per block. FFmpeg decodes460 from the payload including one5-bit code within six padding bits. All459 source-declared samples of each of13 blocks match the maintained decoder byte-for-byte. Raw extra samples and full-output mismatch remain preserved;no source samples removed.',resamplerPhaseAccepted=False,originalRuntimeAccepted=False,listeningAccepted=False);result['pass']=result.pop('pass_');p=M/'audit-v1/adpcm-declared-sample-crosscheck-v1.json';out=json.dumps(result,indent=2)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,blocks=13,declaredSamples=5967,allDeclaredPcmBytesEqual=True,fullOutputExtraPaddingSamples=13)))
