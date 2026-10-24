from pathlib import Path
from http.server import HTTPServer,BaseHTTPRequestHandler
import hashlib,json,mimetypes
M=Path(__file__).resolve().parents[1];R=M.parents[1];X=Path('/Volumes/American Dream/hudongpin/g678-p060-native-browser-20261003-v1')
inventory=json.loads((M/'audio-v1/source-role-inventory-v1.json').read_text())
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def do_GET(self):
  route=self.path.split('?')[0];p=None
  if route in ['/','/index.html','/fixture.js']:p=X/('index.html'if route=='/'else route[1:])
  elif route=='/favicon.ico':self.send_response(204);self.end_headers();return
  elif route.startswith('/audio/'):
   row=next((a for a in inventory['assets']if route=='/audio/'+a['id']),None)
   if row:p=R/row['copy']['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['source']['sha256']
  if p is None:self.send_error(404);return
  b=p.read_bytes();self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(p.name)[0]or'application/octet-stream');self.send_header('Content-Length',str(len(b)));self.send_header('X-Robots-Tag','noindex, nofollow');self.end_headers();self.wfile.write(b)
if __name__=='__main__':
 print('p060 maintained browser fixture 127.0.0.1:4361',flush=True);HTTPServer(('127.0.0.1',4361),Handler).serve_forever()
