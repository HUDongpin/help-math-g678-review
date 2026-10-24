from pathlib import Path
import json,hashlib,http.server,threading,subprocess,datetime,socket,os,sys,time
R=Path.cwd();assert R==Path('/Volumes/WestWorld/HELP MATH 2.0-g678-implementation');M=R/'migrations/shared-alg001-l08-p035';O=R/'output/g678-alg-l08-p035-integration-20261007-v1';CLI='/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh';P=json.loads((O/'source-decode-plan-v1.json').read_text());SESSION=P['session'];PORT=P['port'];sha=lambda b:hashlib.sha256(b).hexdigest()
assert sys.argv[1:]==['--root-window-granted'],'Prepared only; root must assign the exclusive browser/decode window before invoking with --root-window-granted.'
outputs=[O/'source-browser-open-v1.txt',O/'source-decode-cli-v1.txt',O/'source-browser-close-v1.txt',O/'source-decode-disposition-v1.json',M/'native-v1/decode-native-v1.json']
assert all(not p.exists()for p in outputs)
s=socket.socket();assert s.connect_ex(('127.0.0.1',PORT))!=0,'port already in use';s.close();routes={}
for spec in P['streams']:
 p=Path(spec['sourcePath']);assert p.parent==M/'source-v1';b=p.read_bytes();assert len(b)==spec['bytes']and sha(b)==spec['sha256'];routes[spec['path']]=(b,'audio/mpeg')
routes['/']=(b'<!doctype html><meta name="robots" content="noindex"><title>P035 source decode audit</title><h1>P035 source decode audit</h1>','text/html');requests=[]
class Handler(http.server.BaseHTTPRequestHandler):
 def do_GET(self):
  row=routes.get(self.path);requests.append(dict(path=self.path,status=200 if row else 404));self.send_response(200 if row else 404);self.send_header('Content-Type',row[1]if row else'text/plain');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(row[0]if row else b'Not found')
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',PORT),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();code=(M/'generator-v1/decode-native-v1.js').read_text();status=dict(pid=os.getpid(),cwd=str(R),inputPins=P['streams'],phase='native-decode-only',pass_=False,start=datetime.datetime.now(datetime.timezone.utc).isoformat());start=time.monotonic()
def run(args,p):
 r=subprocess.run([CLI,'--session',SESSION]+args,cwd=R,capture_output=True,text=True,timeout=60);p.open('x').write(r.stdout+r.stderr);return r
try:
 r=run(['open',f'http://127.0.0.1:{PORT}/'],outputs[0]);assert r.returncode==0
 r=run(['run-code',code],outputs[1]);assert r.returncode==0
 raw=r.stdout+r.stderr;data=json.loads(raw.split('### Result\n',1)[1].split('\n### Ran',1)[0]);assert data['pass']and len(data['streams'])==10
 for d in data['streams']:
  spec=next(s for s in P['streams']if s['spriteId']==d['spriteId']);assert d['contextClosed']and d['sourceSha256']==spec['sha256']and d['sourceBytes']==spec['bytes']and d['sampleRate']==spec['sampleRate']and d['channels']==1;ff=json.loads((M/'native-v1/decode-ffmpeg-v1.json').read_text());f=next(f for f in ff['streams']if f['spriteId']==d['spriteId']);d['ffmpegPcmSha256']=f['pcmSha256'];d['samePcmAsFfmpeg']=d['pcmSha256']==f['pcmSha256'];d['sameSampleCountAsFfmpeg']=d['decodedSamples']==f['decodedSamples']
 outputs[4].open('x').write(json.dumps(data,indent=2)+'\n');status['pass_']=True;print(json.dumps(dict(pass_=True,streams=len(data['streams']),nativeBrowserDecoded=True)),flush=True)
except BaseException as e:
 status['error']=f'{type(e).__name__}: {e}';raise
finally:
 try:
  r=run(['close'],outputs[2]);status['browserCloseExitCode']=r.returncode
 finally:
  server.shutdown();server.server_close();thread.join(timeout=5);s=socket.socket();status['portClosed']=s.connect_ex(('127.0.0.1',PORT))!=0;s.close();status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),wallSeconds=time.monotonic()-start,requests=requests,session=SESSION);outputs[3].open('x').write(json.dumps(status,indent=2)+'\n')
