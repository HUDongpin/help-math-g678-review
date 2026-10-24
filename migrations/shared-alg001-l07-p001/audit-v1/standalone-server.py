from pathlib import Path
from http.server import BaseHTTPRequestHandler,HTTPServer
ROOT=Path(__file__).resolve().parents[3]; O=ROOT/'output/playwright/alg-l07-p001-standalone-v1'
FILES={'/':(O/'index.html','text/html'),'/app.js':(O/'app.js','application/javascript'),'/app.css':(O/'app.css','text/css'),
 '/stream.mp3':(ROOT/'migrations/shared-alg001-l07-p001/source-v1/source-stream-142.mp3','audio/mpeg'),
 '/fredoka.ttf':(ROOT/'apps/web/public/fonts/lesson-v1/fredoka-variable.ttf','font/ttf'),'/nunito.ttf':(ROOT/'apps/web/public/fonts/lesson-v1/nunito-sans-variable.ttf','font/ttf')}
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/favicon.ico':self.send_response(204);self.end_headers();return
  if self.path not in FILES:self.send_error(404);return
  p,kind=FILES[self.path];b=p.read_bytes();self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(b)));self.send_header('X-Robots-Tag','noindex');self.end_headers();self.wfile.write(b)
HTTPServer(('127.0.0.1',4373),Handler).serve_forever()
