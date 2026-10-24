async(page)=>{
 const phase=await page.locator('[data-p039-main-frame]').getAttribute('data-p039-main-frame');
 const tries=await page.locator('[data-p039-tries]').getAttribute('data-p039-tries');
 const language=page.url().includes('/es/')?'es':'en';
 const state=await page.locator('.p039-exercise__feedback').innerText();
 const tag=state?(state.includes('again')||state.includes('nuevo')?'wrong':state.includes('100')?'reveal':'complete'):'question';
 if(phase!=='546'&&phase!=='579')throw Error('Expected stable exercise or terminal frame; observed '+phase);
 const rows=[];
 for(const scale of [100,200])for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});await page.addStyleTag({content:`html{font-size:${scale}% !important}`});await page.waitForTimeout(120);
  const row=await page.evaluate(()=>{
   const failures=[],blocks=[];
   for(const e of document.querySelectorAll('.lesson-shell2__page-heading > div:first-child > h1,.lesson-shell2__page-heading > div:first-child > p,.p039-exercise__language,.p039-exercise [data-lesson-text-block],.p039-exercise__title,.p039-exercise__feedback,.lesson-shell2__modern-toolbar > button,.lesson-shell2__modern-toolbar > a,.lesson-shell2__modern-timeline > span')){
    const s=getComputedStyle(e),b=e.getBoundingClientRect();if(s.visibility==='hidden'||s.display==='none'||b.width===0||b.height===0)continue;
    const rects=[];const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(!node.textContent.trim())continue;let parent=node.parentElement,hidden=false;while(parent){const cs=getComputedStyle(parent),pb=parent.getBoundingClientRect();if(cs.visibility==='hidden'||cs.display==='none'||parseFloat(cs.fontSize)===0||parseFloat(cs.textIndent)<-100||((pb.width<=1||pb.height<=1)&&(cs.clipPath!=='none'||cs.overflow==='hidden'))){hidden=true;break;}if(parent===e)break;parent=parent.parentElement;}if(hidden)continue;const range=document.createRange();range.selectNodeContents(node);rects.push(...[...range.getClientRects()].filter(r=>r.width>0&&r.height>0));}const glyph={left:rects.length?Math.min(...rects.map(r=>r.left)):b.left,right:rects.length?Math.max(...rects.map(r=>r.right)):b.right};const rec={text:e.textContent?.trim(),left:b.left,right:b.right,glyphLeft:glyph.left,glyphRight:glyph.right,font:s.fontSize};blocks.push(rec);
    if(b.left < -1||b.right>innerWidth+1||glyph.left < -1||glyph.right>innerWidth+1)failures.push(rec);
   }
   return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,rootFont:getComputedStyle(document.documentElement).fontSize,blocks,failures};
  });rows.push({...row,scale});
  if(scale===200&&(width===390||width===1280))await page.screenshot({path:`c3-${language}-${tag}-${width}-text${scale}.png`,fullPage:true});
 }
 const result={phase,tries,language,state,tag,rows};if(rows.some(r=>r.failures.length))throw Error(JSON.stringify(result));return result;
}
