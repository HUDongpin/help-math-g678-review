from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
import os,json,mimetypes,urllib.parse
ROOT=Path(__file__).resolve().parent.parent
MEMBERS={'/standalone-v1/':'standalone-v1/index.html','/standalone-v1/main.js':'standalone-v1/main.js','/standalone-v1/main.css':'standalone-v1/main.css','/native-v1/canvas-renderer-v1.js':'native-v1/canvas-renderer-v1.js','/native-v1/canvas-renderer-v2.js':'native-v1/canvas-renderer-v2.js','/source-v1/source-stream-223.mp3':'source-v1/source-stream-223.mp3'}
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  name=MEMBERS.get(urllib.parse.urlsplit(self.path).path)
  if name is None:self.send_error(404);return
  p=ROOT/name;data=p.read_bytes();kind=mimetypes.guess_type(p.name)[0]or'application/octet-stream'
  self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.send_header('X-Robots-Tag','noindex');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
(ROOT/'audit-v1/standalone-server-process-v3.json').write_text(json.dumps({'pid':os.getpid(),'port':4387,'source':'audit-v1/standalone-server-v3.py'}))
HTTPServer(('127.0.0.1',4387),Handler).serve_forever()
