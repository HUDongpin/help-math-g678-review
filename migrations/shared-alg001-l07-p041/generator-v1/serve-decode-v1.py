from http.server import HTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import json,os
root=Path(__file__).resolve().parents[1]
allowed={f"/stream-{s['spriteId']}.mp3" for s in json.loads((root/'native-v1/streams-v1.json').read_text())}|{'/L7TI04.mp3'}
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/':data=b'<!doctype html><title>P041 local source decoder</title>';kind='text/html'
  elif self.path in allowed:data=(root/'source-v1'/self.path[1:]).read_bytes();kind='audio/wav' if self.path.endswith('.wav') else 'audio/mpeg'
  else:self.send_error(404);return
  self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
 def log_message(self,*args):pass
server=HTTPServer(('127.0.0.1',4398),Handler)
(root/'audit-v1/decode-server-v1.json').write_text(json.dumps({'pid':os.getpid(),'host':'127.0.0.1','port':4398,'files':sorted(allowed)}))
print('P041 source decoder listening on 127.0.0.1:4398',flush=True)
server.serve_forever()
