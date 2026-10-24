import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildNmsL02CandidatePlayer,prepareNmsL02CandidatePlayer} from './prepare-nms-l02-candidate-player.mjs';

test('candidate player is an exact twelve-transform projection of pinned v3',()=>{
 const {source,output,receipt,transforms}=buildNmsL02CandidatePlayer();
 assert.equal(source.pin.sha256,'6ce7fa830208f76ac40c3c81a289e2c92dc587e13aa172e354a6fe5399f33522');
 assert.equal(receipt.generated.sha256,'6f6fbe94984ecf01f7169b9087a22697b3659d789cbe4c12465ce51bf7f71fec');
 assert.equal(transforms.length,12);
 let restored=output.toString('utf8');
 for(const [,before,after] of [...transforms].reverse()){
  assert.equal(restored.split(after).length,2);
  restored=restored.replace(after,before);
 }
 assert.equal(restored,source.bytes.toString('utf8'));
 assert.equal(prepareNmsL02CandidatePlayer('--check').status,'CANDIDATE_PLAYER_VERIFIED');
});

test('candidate prop changes formal displayed counts but leaves page availability and navigation intact',()=>{
 const generated=buildNmsL02CandidatePlayer().output.toString('utf8');
 assert.match(generated,/export function G678NmsL02CandidatePlayer\(/);
 assert.match(generated,/unregisteredCandidateIds\?: readonly string\[\]/);
 assert.match(generated,/unregisteredCandidateIds = \[\]/);
 assert.match(generated,/const unavailablePageCount = totalPageCount - registeredPages\.length/);
 assert.match(generated,/const reviewedRegisteredCount = registeredPages\.filter/);
 assert.match(generated,/currentJsPageCount: displayedRegisteredPageCount/);
 assert.match(generated,/displayedRegisteredPageCount === descriptor\.course\.activePageCount &&\n    unregisteredCandidatePageCount === 0/);
 assert.equal((generated.match(/\$\{candidateCountLabel\}/g)??[]).length,6,
  'reviewer and both package variants each have bilingual candidate disclosure');
 assert.match(generated,/\$\{unregisteredCandidatePageCount\} páginas candidatas sin registrar/);
 assert.match(generated,/\$\{unregisteredCandidatePageCount\} unregistered candidate pages/);
 assert.equal((generated.match(/registeredPages\.length/g)??[]).length,2,
  'raw registered list is used only for availability and candidate subtraction');
});
