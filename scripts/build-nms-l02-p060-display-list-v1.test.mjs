import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildP060DisplayList,extractP060Domain,renderP060DisplayList} from './build-nms-l02-p060-display-list-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;

test('P060 generated visual domain and text bind exact source bytes',()=>{
 const value=buildP060DisplayList();
 assert.equal(value.meta.mainFrames,721);
 assert.deepEqual(value.meta.authoredStops,[262,400,527,646,699,718]);
 assert.equal(Object.keys(value.domains).length,14);
 assert.equal(value.domains[391].events.filter(event=>event[1]==='r').length,210);
 assert.equal(value.domains[139].frames,21);
 assert.equal(value.domains[190].frames,109);
 assert.equal(value.domains[388].frames,1);
 assert.equal(value.text[372].replaceAll('\n--- RECORDSEPARATOR ---\n',''),
  'Fractions and decimals are equivalent when they represent the same value.');
 const main=value.domains[391].events;
 for(const [frame,characterId] of [[262,61],[262,63],[527,139],[646,190],[699,388],[699,192],[699,193]])
  assert(main.some(event=>event[0]===frame&&event[1]==='p'&&event[3]===characterId),`${frame}/${characterId}`);
 for(const event of main.filter(event=>event[0]===699&&[192,193].includes(event[3])))
  assert.equal(event[6]?.[3],0,'answer hit regions are transparent');
 assert.equal(fs.readFileSync(path.join(root,'packages/demos/src/generated/nms-l02-p060-display-list-v1.ts'),'utf8'),
  renderP060DisplayList(value));
});

test('extractor rejects an unrepresented visual operation and a removal of absent depth',()=>{
 const counts={frames:1,directTagCounts:{PlaceObject2:1,RemoveObject2:0,ShowFrame:1,End:1}};
 const base='<DefineSprite objectID="391" frames="1"><tags><PlaceObject2 replace="0" depth="1" objectID="5"/><ShowFrame/><End/></tags></DefineSprite>';
 assert.equal(extractP060Domain(base,391,counts).events.length,1);
 assert.throws(()=>extractP060Domain(base.replace('<ShowFrame/>','<PlaceObject3/><ShowFrame/>'),391,counts),/unsupported visual tag/);
 assert.throws(()=>extractP060Domain(base.replace('<PlaceObject2 replace="0" depth="1" objectID="5"/>','<RemoveObject2 depth="1"/>'),391,
  {frames:1,directTagCounts:{RemoveObject2:1,ShowFrame:1,End:1}}),/remove missing depth/);
});
