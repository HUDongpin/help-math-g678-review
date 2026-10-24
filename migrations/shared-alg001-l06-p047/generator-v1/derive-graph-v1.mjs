/** Preserve the actual shape27 curve; do not fit a new mathematical function. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url),sha=raw=>createHash('sha256').update(raw).digest('hex');
const sourcePath='output/g678-p047-canvas-preparation-20261002-v1/source-export/frames/frames.html';
const source=fs.readFileSync(new URL(sourcePath,root),'utf8');
const intake=JSON.parse(fs.readFileSync(new URL('output/g678-p047-canvas-preparation-20261002-v1/canvas-extraction-v1.json',root)));
// The full exporter input is already source-pinned by the Canvas extractor.
assert(JSON.stringify(intake).includes(sha(source)),'source export in extraction inventory');
const body=source.match(/function shape27\([^]*?(?=\nfunction )/)[0];
const path=body.match(/var pathData="([^"]+)"/)[1];
assert.equal(path,'M -2050 -1050 Q -2486 2099 -4009 2514 -5496 2131 -5952 -1040');
// Modern graph uses 20 SVG units per mathematical unit. Retain the source
// curve's shape under one affine map from its endpoint span and bottom anchor
// to the diagram's x=-6..6 and y=6..-5 range; original artwork is not exact ticks.
const values=path.match(/-?\d+/g).map(Number),sx=240/(values[0]-values.at(-2));
const sy=220/(values[5]-values[1]);
const tx=60-sx*values.at(-2),ty=60-sy*values[1];
const value={kind:'p047-source-curve-v1',sourceShape:27,sourceExportPath:sourcePath,sourceExportSha256:sha(source),
 rawPath:path,transform:[sx,0,0,sy,tx,ty],sourceEndpoints:[[-2050,-1050],[-5952,-1040]],
 sourceBottomAnchor:[-4009,2514],targetRange:{x:[60,300],y:[60,280]},pixelFidelityAccepted:false};
const bytes=JSON.stringify(value,null,2)+'\n',out=new URL('../native-v1/graph-curve-v1.json',import.meta.url);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write')fs.writeFileSync(out,bytes,{flag:'wx'});
assert.equal(fs.readFileSync(out,'utf8'),bytes);
console.log(JSON.stringify({mode:process.argv[2],sha256:sha(bytes),sourceShape:27}));
