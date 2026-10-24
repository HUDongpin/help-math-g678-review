import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildP061DisplayList,extractP061Domain,renderP061DisplayList} from './prepare-nms-l02-p061-display-list-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.env.HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';

test('all twenty sprite domains, source text and bounds bind the pinned SWF extraction',()=>{
 const value=buildP061DisplayList();
 assert.equal(value.meta.mainSpriteId,315);
 assert.equal(value.meta.mainFrames,882);
 assert.deepEqual(value.meta.authoredStops,[435,573,700,817,860,879]);
 assert.equal(Object.keys(value.domains).length,20);
 assert.equal(value.domains[111].frames,21);
 assert.equal(value.domains[118].frames,27);
 assert.equal(value.domains[314].frames,1);
 assert.equal(value.domains[315].events.filter(event=>event[1]==='r').length,51);
 assert.equal(Object.keys(value.text).length,63);
 assert.equal(Object.keys(value.bounds).length,63);
 assert.match(value.text[38],/Taylor will pay  25% less/);
 assert(value.bounds[38].twips.every(Number.isFinite));
 assert.deepEqual(value.meta.rootPlacements.map(row=>[row.depth,row.characterId]),[[1,15],[3,315],[332,316]]);
 const main=value.domains[315].events;
 assert(main.some(event=>event[0]===701&&event[1]==='p'&&event[3]===96));
 assert(main.some(event=>event[0]===860&&event[1]==='p'&&event[3]===314));
 const target=path.join(root,'packages/demos/src/generated/nms-l02-p061-display-list-v1.ts');
 assert.equal(fs.readFileSync(target,'utf8'),renderP061DisplayList(value));
 const receipt=JSON.parse(fs.readFileSync(path.join(root,'output/nms-l02-p061-display-20260927/receipt.json')));
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 assert.equal(receipt.output.sha256,hash(fs.readFileSync(target)));
 assert.equal(receipt.generator.sha256,
  hash(fs.readFileSync(path.join(root,'scripts/prepare-nms-l02-p061-display-list-v1.mjs'))));
 assert.equal(receipt.domains,20);
 assert.equal(receipt.textRecords,63);
 assert.equal(receipt.registrationEffect,false);
 assert.equal(receipt.acceptanceEffect,false);
});

test('sprite parser rejects unrepresented placement and invalid depth removal',()=>{
 const counts={frames:1,directTagCounts:{PlaceObject2:1,RemoveObject2:0,ShowFrame:1,End:1}};
 const base='<DefineSprite objectID="315" frames="1"><tags><PlaceObject2 replace="0" depth="1" objectID="5"/><ShowFrame/><End/></tags></DefineSprite>';
 assert.equal(extractP061Domain(base,315,counts).events.length,1);
 assert.throws(()=>extractP061Domain(base.replace('<ShowFrame/>','<PlaceObject3/><ShowFrame/>'),315,counts),/unsupported visual tag/);
 assert.throws(()=>extractP061Domain(base.replace('<PlaceObject2 replace="0" depth="1" objectID="5"/>','<RemoveObject2 depth="1"/>'),315,
  {frames:1,directTagCounts:{RemoveObject2:1,ShowFrame:1,End:1}}),/remove missing depth/);
});
