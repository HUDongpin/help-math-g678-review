from pathlib import Path
import json,hashlib,http.server,threading,subprocess,datetime,socket
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p016';O=R/'output/g678-alg-l08-p016-integration-20261006-v1';D=Path('/Volumes/American Dream/.g6l8p16a1/source-extraction-v1');CLI='/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh';SESSION='g678-l8-p016-source-v1-20261006'
sha=lambda b:hashlib.sha256(b).hexdigest();specs=[];routes={}
for s in json.loads((M/'native-v1/streams-v1.json').read_text()):
 p=M/f'source-v1/stream-{s["spriteId"]}.mp3';b=p.read_bytes();assert sha(b)==s['sourceSha256'];url=f'/stream-{s["spriteId"]}.mp3';routes[url]=(b,'audio/mpeg');specs.append(dict(spriteId=s['spriteId'],sampleRate=s['sampleRate'],path=url,bytes=len(b),sha256=sha(b),expectedSamples=s['decodedSamplesCandidate']))
p=M/'source-v1/L8VB11.mp3';b=p.read_bytes();routes['/sa.mp3']=(b,'audio/mpeg');specs.append(dict(spriteId='SA',sampleRate=48000,path='/sa.mp3',bytes=len(b),sha256=sha(b)))
routes['/']=(b'<!doctype html><title>P016 source audit</title><h1>P016 source decode and static inspection</h1>','text/html')
requests=[]
class Handler(http.server.BaseHTTPRequestHandler):
 def do_GET(self):
  row=routes.get(self.path);requests.append(dict(path=self.path,status=200 if row else 404));self.send_response(200 if row else 404);self.send_header('Content-Type',row[1]if row else'text/plain');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(row[0]if row else b'Not found')
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',4395),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
code='''async (basePage) => {
 const context=await basePage.context().browser().newContext();const page=await context.newPage();try{
 await page.goto('http://127.0.0.1:4395/');
 const streams=SPEC;
 const result=await page.evaluate(async streams=>{
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');const measured=[];
 for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.path),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
 return {pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};},streams);
 return result;
 }finally{await context.close();}
}'''.replace('SPEC',json.dumps(specs))
(M/'generator-v1/decode-native-v1.js').open('x').write(code)
status={}
try:
 r=subprocess.run([CLI,'--session',SESSION,'open','http://127.0.0.1:4395/'],cwd=R,capture_output=True,text=True);(O/'source-browser-open-v1.txt').open('x').write(r.stdout+r.stderr);assert r.returncode==0
 r=subprocess.run([CLI,'--session',SESSION,'run-code',code],cwd=R,capture_output=True,text=True);raw=r.stdout+r.stderr;(O/'source-decode-cli-v1.txt').open('x').write(raw);assert r.returncode==0
 data=json.loads(raw.split('### Result\n',1)[1].split('\n### Ran',1)[0]);assert data['pass'];(M/'native-v1/decode-native-v1.json').open('x').write(json.dumps(data,indent=2)+'\n');status['pass']=True;print(json.dumps(data),flush=True)
finally:
 r=subprocess.run([CLI,'--session',SESSION,'close'],cwd=R,capture_output=True,text=True);(O/'source-browser-close-v1.txt').open('x').write(r.stdout+r.stderr);status['browserCloseExitCode']=r.returncode
 server.shutdown();server.server_close();thread.join(timeout=5);s=socket.socket();status['portClosed']=s.connect_ex(('127.0.0.1',4395))!=0;s.close();status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),requests=requests,session=SESSION);(O/'source-decode-disposition-v1.json').open('x').write(json.dumps(status,indent=2)+'\n')
