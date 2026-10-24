import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildP062DisplayList,extractP062Domain,renderP062DisplayList} from './prepare-nms-l02-p062-display-list-v1.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
process.env.HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';

test('all twenty source domains, 72 text records, geometry and editorial sources are sealed',()=>{
 const value=buildP062DisplayList();
 assert.equal(value.meta.sourceSwfSha256,'5a075362f005aab68406d5fae2378f622a64520ec19e4b03b9ac9abbbd5faa50');
 assert.equal(value.meta.mainSpriteId,315);assert.equal(value.meta.mainFrames,837);
 assert.deepEqual(value.meta.authoredStops,[384,523,650,766,815,834]);
 assert.deepEqual(value.meta.rootPlacements.map(row=>[row.depth,row.characterId]),[[1,15],[3,315],[344,316]]);
 assert.equal(Object.keys(value.domains).length,20);
 assert.equal(value.domains[106].frames,21);assert.equal(value.domains[122].frames,27);
 assert.equal(value.domains[314].frames,1);
 assert.equal(value.domains[315].events.filter(event=>event[1]==='r').length,50);
 assert.equal(Object.keys(value.text).length,72);
 assert.equal(Object.keys(value.bounds).length,72);
 assert.equal(Object.keys(value.styles).length,72);
 assert(value.bounds[38].twips.every(Number.isFinite));
 assert.equal(value.styles[38][0].fontId,3);
 assert.equal(value.styles[38][0].fontHeightTwips,310);
 assert.equal(value.styles[38][0].color.red,0);
 assert.deepEqual(value.meta.editorialDeviations.map(row=>row.issue),['tax-base','example-rate']);
 assert(value.meta.editorialDeviations.every(row=>row.originalRuntimeParityEstablished===false));
 assert.match(value.text[41],/^total cost\. What is the total cost/);
 assert.equal(value.text[309],'Taxes = 8% of Original Cost');
 assert.match(value.text[306],/7\.5%/);
 assert.match(value.text[310],/\$53\.75/);
 const main=value.domains[315].events;
 for(const [frame,id] of [[10,38],[100,41],[524,86],[651,91],[767,111],[815,314]])
  assert(main.some(event=>event[0]===frame&&event[1]==='p'&&event[3]===id),`source entry ${id} at ${frame}`);
 const generated=path.join(root,'packages/demos/src/generated/nms-l02-p062-display-list-v1.ts');
 assert.equal(fs.readFileSync(generated,'utf8'),renderP062DisplayList(value));
 const receipt=JSON.parse(fs.readFileSync(path.join(root,'output/nms-l02-p062-display-20260928/receipt.json')));
 assert.equal(receipt.output.sha256,sha(fs.readFileSync(generated)));
 assert.equal(receipt.generator.sha256,sha(fs.readFileSync(path.join(root,'scripts/prepare-nms-l02-p062-display-list-v1.mjs'))));
 assert.equal(receipt.hostWordingAudit.sha256,value.meta.hostWordingAuditSha256);
 assert.equal(receipt.registrationEffect,false);assert.equal(receipt.acceptanceEffect,false);
});

test('display parser rejects unsupported tags, impossible removals and unmatched updates',()=>{
 const counts={frames:1,directTagCounts:{PlaceObject2:1,ShowFrame:1,End:1}};
 const base='<DefineSprite objectID="315" frames="1"><tags><PlaceObject2 replace="0" depth="1" objectID="5"/><ShowFrame/><End/></tags></DefineSprite>';
 assert.equal(extractP062Domain(base,315,counts).events.length,1);
 assert.throws(()=>extractP062Domain(base.replace('<ShowFrame/>','<PlaceObject3/><ShowFrame/>'),315,counts),/unsupported visual tag/u);
 assert.throws(()=>extractP062Domain(base,315,{frames:1,directTagCounts:{...counts.directTagCounts,UnknownTag:1}}),/unsupported audited tag/u);
 assert.throws(()=>extractP062Domain(base.replace('<PlaceObject2 replace="0" depth="1" objectID="5"/>','<RemoveObject2 depth="1"/>'),315,
  {frames:1,directTagCounts:{RemoveObject2:1,ShowFrame:1,End:1}}),/remove missing depth/u);
 assert.throws(()=>extractP062Domain(base.replace('replace="0"','replace="1"'),315,counts),/update absent depth/u);
});
