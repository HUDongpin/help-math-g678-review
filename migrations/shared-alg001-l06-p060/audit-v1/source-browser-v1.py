from pathlib import Path
import hashlib,json,mimetypes,socket,sys
from http.server import HTTPServer,BaseHTTPRequestHandler
M=Path(__file__).resolve().parents[1];R=M.parents[1]
E=Path('/Volumes/American Dream/hudongpin/g678-p060-source-extraction-20261003-v1/ffdec-export')
X=Path('/Volumes/American Dream/hudongpin/g678-p060-source-browser-20261003-v1')
def sha(b):return hashlib.sha256(b).hexdigest()
def prepare():
 X.mkdir(exist_ok=True);inventory=json.loads((M/'audio-v1/source-role-inventory-v1.json').read_text());receipt=json.loads((M/'audit-v1/source-extraction-v1.json').read_text());html=(E/'frames/frames.html').read_bytes();helper=(E/'frames/canvas.js').read_bytes()
 for name,b in [('frames/frames.html',html),('frames/canvas.js',helper)]:assert sha(b)==next(r['sha256']for r in receipt['files']if r['path']==name)
 s=html.decode().replace('\r\n','\n');old='window.setInterval(function(){nextFrame(ctx,ctrans);},83);\nnextFrame(ctx,ctrans);';assert s.count(old)==1
 s=s.replace('place("sprite15",','if(window.finishVisible) place("sprite15",')
 s=s.replace(old,'''window.drawQuestion = id => {
 if(!Number.isInteger(id)||id<1||id>24)throw Error('question');
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#b8d8f7';ctx.fillRect(0,0,800,600);
 place("shape1",canvas,ctx,[0.05,0,0,0.05,0,0],ctrans,1,0,0,0);
 place("sprite973",canvas,ctx,[0.05,0,0,0.05,367.5,216.1],ctrans,1,id,0,0);
 };window.drawQuestion(1);''')
 (X/'source.html').write_text(s);(X/'canvas.js').write_bytes(helper)
 manifest=[{'id':a['id'],'bytes':a['source']['bytes'],'sha256':a['source']['sha256']}for a in inventory['assets']]
 (X/'audio-manifest.json').write_text(json.dumps(manifest))
 return inventory
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def do_GET(self):
  route=self.path.split('?')[0];p=None
  if route in ['/source.html','/canvas.js','/audio-manifest.json']:p=X/route[1:]
  elif route.startswith('/audio/'):
   row=next((a for a in inventory['assets']if route=='/audio/'+a['id']),None)
   if row:p=R/row['copy']['path'];assert sha(p.read_bytes())==row['source']['sha256']
  if p is None:self.send_error(404);return
  b=p.read_bytes();self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(p.name)[0]or'application/octet-stream');self.send_header('Content-Length',str(len(b)));self.send_header('X-Robots-Tag','noindex, nofollow');self.end_headers();self.wfile.write(b)
if __name__=='__main__':
 inventory=prepare();server=HTTPServer(('127.0.0.1',4360),Handler);print('p060 source inspection and audio measurement 127.0.0.1:4360',flush=True);server.serve_forever()
