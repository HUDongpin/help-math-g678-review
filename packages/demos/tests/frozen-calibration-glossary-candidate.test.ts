import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {validateFrozenGlossaryControls, visibleFrozenGlossaryControls} from '../src/frozen-calibration-glossary-candidate';

const root=new URL('../../../',import.meta.url);
const audit=JSON.parse(readFileSync(new URL('work/g678-shared-page-factory/frozen16-glossary-audit-v1/audit.json',root),'utf8'));
for(const row of audit.records){
  test(`${row.animationId}: all source visibility intervals and fade boundaries`,()=>{
    validateFrozenGlossaryControls(row.buttons,row.mainFrameCount);
    for(let frame=1;frame<=row.mainFrameCount;frame++){
      const actual=visibleFrozenGlossaryControls(row.buttons,frame).map(c=>c.sourceCharacterId);
      const expected=row.buttons.filter((c:any)=>c.ranges.some((r:any)=>frame>=r.firstFrame&&frame<=r.lastFrame)).map((c:any)=>c.sourceCharacterId);
      assert.deepEqual(actual,expected);
    }
    for(const c of row.buttons)for(const r of c.ranges){
      assert(visibleFrozenGlossaryControls(row.buttons,r.firstFrame).includes(c));
      assert(visibleFrozenGlossaryControls(row.buttons,r.lastFrame).includes(c));
    }
  });
}
test('authored alpha-zero phases stay hidden and recurring controls reappear',()=>{
  const dat=audit.records.find((r:any)=>r.animationId==='shared-dat001-l07-p025');
  const controls=dat.buttons.filter((c:any)=>[30,31].includes(c.sourceCharacterId));
  assert.equal(visibleFrozenGlossaryControls(controls,1).length,0);
  assert.equal(visibleFrozenGlossaryControls(controls,2).length,2);
  // A newly fading placement must not hide older visible instances of the
  // same source button character at depths 23/25 and 30/34.
  assert.equal(visibleFrozenGlossaryControls(controls,277).length,2);
  const laterInstances=controls.map((c:any)=>({...c,ranges:c.ranges.filter((r:any)=>r.depth>=100)}));
  assert.equal(visibleFrozenGlossaryControls(laterInstances,277).length,0);
  assert.equal(visibleFrozenGlossaryControls(laterInstances,278).length,2);
  const nms=audit.records.find((r:any)=>r.animationId==='shared-nms002-l05-p040');
  assert.equal(visibleFrozenGlossaryControls(nms.buttons,84).length,0);
  assert.equal(visibleFrozenGlossaryControls(nms.buttons,85).length,2);
});
test('duplicate character IDs and invalid/overlapping ranges fail closed',()=>{
  const c=audit.records[0].buttons[0];
  assert.throws(()=>validateFrozenGlossaryControls([c,c],1250));
  assert.throws(()=>validateFrozenGlossaryControls([{...c,ranges:[{firstFrame:0,lastFrame:2,depth:4}]}],1250));
  assert.throws(()=>validateFrozenGlossaryControls([{...c,ranges:[{firstFrame:8,lastFrame:9,depth:4},{firstFrame:9,lastFrame:12,depth:4}]}],1250));
  assert.equal(visibleFrozenGlossaryControls([c],NaN).length,0);
});
