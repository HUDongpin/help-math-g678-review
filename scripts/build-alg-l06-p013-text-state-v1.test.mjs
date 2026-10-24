import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {p013TextStateOutputs} from './build-alg-l06-p013-text-state-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
test('P013 generated text state and audit are reproducible from exact source pins',
  {skip:!fs.existsSync(path.join(sourceRoot,'G6-G8-shared/ALG001/L6/VB/L6VB04.swf'))},()=>{
    const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
    process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
    try{
      const outputs=p013TextStateOutputs();
      assert.equal(outputs.size,3);
      for(const [relative,expected] of outputs)
        assert.deepEqual(fs.readFileSync(path.join(root,relative)),expected,relative);
    }finally{
      if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
      else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;
    }
  });
