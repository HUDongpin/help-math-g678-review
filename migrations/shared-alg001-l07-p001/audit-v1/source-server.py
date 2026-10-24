from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path=='/': data=b'<!doctype html><html><head><title>L7 source audio measurement</title></head><body>Local source audio measurement</body></html>'; kind='text/html'
        elif self.path=='/stream.mp3':data=(ROOT/'source-v1/source-stream-142.mp3').read_bytes();kind='audio/mpeg'
        else:self.send_error(404);return
        self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.send_header('X-Robots-Tag','noindex');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
HTTPServer(('127.0.0.1',4372),Handler).serve_forever()
