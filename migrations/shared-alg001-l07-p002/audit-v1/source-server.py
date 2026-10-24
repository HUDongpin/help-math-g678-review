from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
import mimetypes
ROOT=Path(__file__).resolve().parent.parent
FILES={
 '/':ROOT/'source-v1/canvas-export/frames/frames.html',
 '/normalized.html':ROOT/'audit-v1/normalized-source-view.html',
 '/canvas.js':ROOT/'source-v1/canvas-export/frames/canvas.js',
 '/stream.mp3':ROOT/'source-v1/source-stream-452.mp3',
 '/sa.mp3':Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7/SA/L7RW02.mp3'),
}
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/favicon.ico':self.send_response(204);self.end_headers();return
  if self.path not in FILES:self.send_error(404);return
  p=FILES[self.path];b=p.read_bytes();self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(p)[0] or 'application/octet-stream');self.send_header('Content-Length',str(len(b)));self.send_header('X-Robots-Tag','noindex');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(b)
HTTPServer(('127.0.0.1',4382),Handler).serve_forever()
