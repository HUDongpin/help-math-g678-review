from pathlib import Path
import subprocess,json,os,signal,time,socket,datetime
R=Path.cwd();B=R/'migrations/shared-alg001-l07-p015';A=B/'audit-v1'
s=socket.socket();s.bind(('127.0.0.1',4392));s.close()
with(A/'decode-source-server-v1.txt').open('x')as f:proc=subprocess.Popen(['python3','-m','http.server','4392','--bind','127.0.0.1','--directory',str(B/'source-v1')],stdout=f,stderr=subprocess.STDOUT,start_new_session=True)
(A/'decode-source-server-v1.json').open('x').write(json.dumps(dict(pid=proc.pid,port=4392,root=str(B/'source-v1')))+'\n')
try:
 for _ in range(100):
  try:
   with socket.create_connection(('127.0.0.1',4392),timeout=.2):break
  except OSError:assert proc.poll()is None;time.sleep(.05)
 code=(B/'generator-v1/decode-and-inspect-v1.js').read_text()
 with(A/'decode-native-cli-v1.txt').open('x')as f:r=subprocess.run(['/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh','--session','g678-l7-p012-20261003','run-code',code],stdout=f,stderr=subprocess.STDOUT)
 raw=(A/'decode-native-cli-v1.txt').read_text();data=json.loads(raw.split('### Result\n',1)[1].split('\n### Ran',1)[0]);assert data['pass'];(B/'native-v1/decode-native-v1.json').open('x').write(json.dumps(data,indent=2)+'\n');print(json.dumps(data),flush=True)
finally:
 if proc.poll()is None:os.killpg(proc.pid,signal.SIGTERM);proc.wait(timeout=10)
 (A/'decode-source-server-disposition-v1.json').open('x').write(json.dumps(dict(pid=proc.pid,exitCode=proc.returncode,closed=True,at=datetime.datetime.now(datetime.timezone.utc).isoformat()))+'\n')
