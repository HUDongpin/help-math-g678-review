from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
from urllib.parse import urlparse
R=Path.cwd();O=R/'output/alg-l07-p002-standalone-v4';B=R/'migrations/shared-alg001-l07-p002'
paths={'/':(O/'index.html','text/html'),'/app.js':(O/'app.js','text/javascript'),'/app.css':(O/'app.css','text/css'),'/stream.mp3':(B/'source-v1/source-stream-452.mp3','audio/mpeg'),'/flash-assets/g678-local/shared-alg001-l07-p002/native-canvas-renderer.js':(B/'canvas-v1/native-canvas-renderer-v2.js','text/javascript')}
for name in ['nunito-sans-variable.ttf','fredoka-variable.ttf']:
 paths['/fonts/lesson-v1/'+name]=(R/'apps/web/public/fonts/lesson-v1'/name,'font/ttf')
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  entry=paths.get(urlparse(self.path).path)
  if not entry:self.send_error(404);return
  p,mime=entry;b=p.read_bytes();self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(b)));self.send_header('Cache-Control','no-store');self.send_header('X-Robots-Tag','noindex');self.end_headers();self.wfile.write(b)
HTTPServer(('127.0.0.1',4383),Handler).serve_forever()
