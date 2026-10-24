import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {p015TextStateOutputs} from './build-alg-l06-p015-text-state-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
test('P015 source text IR and generated TypeScript exactly regenerate from pinned physical source',
  {skip:!fs.existsSync(path.join(sourceRoot,'G6-G8-shared/ALG001/L6/VB/L6VB06.swf'))},()=>{
    const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
    process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
    try{
      const outputs=p015TextStateOutputs();
      assert.equal(outputs.size,3);
      for(const [relative,expected] of outputs)
        assert.deepEqual(fs.readFileSync(path.join(root,relative)),expected,relative);
    }finally{
      if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
      else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;
    }
  });
