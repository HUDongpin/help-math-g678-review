import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import path from 'node:path';

import {p056SourceSpriteSvg} from '../packages/demos/src/timelines/shared-nms002-l02-p056-svg';

const [frameArg, viewport, output] = process.argv.slice(2);
const frame = Number(frameArg);
assert.ok(Number.isInteger(frame) && frame >= 1 && frame <= 234);
assert.ok(viewport === 'native-stage' || viewport === 'forensic-crop');
assert.ok(output && path.isAbsolute(output) && output.endsWith('.svg'));
writeFileSync(output, p056SourceSpriteSvg(frame, 'p056-probe', viewport), {flag: 'wx'});
process.stdout.write(`WROTE ${output}\n`);
