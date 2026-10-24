import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';
import {P052_INTRO_SCENE} from '../packages/demos/src/generated/nms-l02-p052-intro-scene-v1.ts';
const out=fs.mkdtempSync('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p052-vector-preview-');
const cols=5,cellW=160,cellH=130,layers=[];
for(const [i,v]of P052_INTRO_SCENE.vectors.entries()){
 const tile=await sharp(Buffer.from(v.svg)).resize(140,95,{fit:'inside'}).png().toBuffer({resolveWithObject:true});
 const x=i%cols*cellW,y=Math.floor(i/cols)*cellH;
 layers.push({input:tile.data,left:x+Math.floor((cellW-tile.info.width)/2),top:y+25+Math.floor((95-tile.info.height)/2)});
 layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="24"><text x="8" y="18" font-size="16" font-family="sans-serif" fill="#111">Source ${v.characterId}</text></svg>`),left:x,top:y});
}
const image=await sharp({create:{width:cols*cellW,height:Math.ceil(P052_INTRO_SCENE.vectors.length/cols)*cellH,channels:4,background:'#f4f6f8'}}).composite(layers).png().toBuffer();
const file=path.join(out,'source-vector-contact.png');fs.writeFileSync(file,image,{flag:'wx'});
fs.writeFileSync(path.join(out,'README.txt'),'Source vector contact sheet only; not original-runtime or candidate-page evidence. 37 selected intro shape exports; labels added for inspection.\n',{flag:'wx'});
console.log(JSON.stringify({file,bytes:image.length,sourceShapes:P052_INTRO_SCENE.vectors.length}));
