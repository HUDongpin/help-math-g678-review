async(page)=>{
 const phase=await page.locator('[data-p039-main-frame]').getAttribute('data-p039-main-frame');
 const tries=await page.locator('[data-p039-tries]').getAttribute('data-p039-tries');
 const language=page.url().includes('/es/')?'es':'en';
 const state=await page.locator('.p039-exercise__feedback').innerText();
 const tag=state?(state.includes('again')||state.includes('nuevo')?'wrong':state.includes('100')?'reveal':'complete'):'question';
 const rows=[];
 for(const scale of [100,200])for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});await page.addStyleTag({content:`html{font-size:${scale}% !important}`});await page.waitForTimeout(120);
  const row=await page.evaluate(()=>{
   const failures=[],blocks=[];
   for(const e of document.querySelectorAll('.p039-exercise [data-lesson-text-block],.p039-exercise__title,.p039-exercise__feedback,.lesson-shell2__modern-toolbar > button,.lesson-shell2__modern-toolbar > a,.lesson-shell2__modern-timeline > span')){
    const s=getComputedStyle(e),b=e.getBoundingClientRect();if(s.visibility==='hidden'||s.display==='none'||b.width===0||b.height===0)continue;
    const r=document.createRange();r.selectNodeContents(e);const glyph=r.getBoundingClientRect();const rec={text:e.textContent?.trim(),left:b.left,right:b.right,glyphLeft:glyph.left,glyphRight:glyph.right,font:s.fontSize};blocks.push(rec);
    if(b.left < -1||b.right>innerWidth+1||glyph.left < -1||glyph.right>innerWidth+1)failures.push(rec);
   }
   return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,rootFont:getComputedStyle(document.documentElement).fontSize,blocks,failures};
  });rows.push({...row,scale});
  if(scale===200&&(width===390||width===1280))await page.screenshot({path:`${language}-${tag}-${width}-text${scale}.png`,fullPage:true});
 }
 const result={phase,tries,language,state,tag,rows};if(rows.some(r=>r.failures.length))throw Error(JSON.stringify(result));return result;
}
