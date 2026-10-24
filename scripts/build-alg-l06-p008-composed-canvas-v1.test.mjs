import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildP008ComposedCanvas} from './build-alg-l06-p008-composed-canvas-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(ROOT,'output/alg-l06-p008-composed-canvas-v1/successor-v4');

test('root-frame-6 composition is source ordered, physically pinned, and reproducible',()=>{
  const built=buildP008ComposedCanvas();
  assert(readFileSync(path.join(OUT,'canvas-renderer.js')).equals(built.runtime));
  assert(readFileSync(path.join(OUT,'preview.html')).equals(built.preview));
  assert(readFileSync(path.join(OUT,'composed-manifest.json')).equals(built.manifest));
  const manifest=JSON.parse(built.manifest);
  assert.deepEqual(manifest.sourceDepthOrder.map(item=>[item.depth,item.characterId]),
    [[1,507],[502,508],[503,510],[505,511]]);
  assert.deepEqual(manifest.sourceDepthOrder.map(item=>item.placementPixels),[
    {x:369.5,y:253},{x:143.35,y:-185},{x:400,y:43.95},{x:0,y:0},
  ]);
  assert.equal(manifest.sourceTextDisposition.startsWith('All source text'),true);
  assert.equal(manifest.acceptanceEffects.currentJsRegistered,false);
});

test('callable root composition draws both title and main within the 800×600 stage',async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:820,height:680}});
    for(const frame of [1,938]){
      await page.goto(`${pathToFileURL(path.join(OUT,'preview.html')).href}?frame=${frame}`);
      await page.waitForFunction(()=>document.body.dataset.candidateReady==='true'||Boolean(document.body.dataset.candidateError),null,{timeout:30000});
      const data=await page.evaluate(()=>{
        const c=document.querySelector('#stage');
        const pixels=c.getContext('2d').getImageData(0,0,800,600).data;
        let top=0,body=0,minX=800,maxX=-1,minY=600,maxY=-1;
        for(let y=0;y<600;y++)for(let x=0;x<800;x++){
          const i=(y*800+x)*4;
          if(pixels[i]===184&&pixels[i+1]===216&&pixels[i+2]===247)continue;
          if(y<180)top++;else body++;
          minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        }
        return {error:document.body.dataset.candidateError??null,ready:document.body.dataset.candidateReady??null,
          frame:c.dataset.flashFrame,top,body,bounds:{minX,maxX,minY,maxY}};
      });
      assert.equal(data.error,null);
      assert.equal(data.ready,'true');
      assert.equal(data.frame,String(frame));
      assert(data.top>100&&data.body>60000,`title and full-scale main draw at frame ${frame}: ${JSON.stringify(data)}`);
      assert(data.bounds.minX>=0&&data.bounds.maxX<800&&data.bounds.minY>=0&&data.bounds.maxY<600);
    }
    await page.close();
  }finally{await browser.close();}
});
