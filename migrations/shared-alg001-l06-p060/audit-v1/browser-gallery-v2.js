async page => {
 await page.goto('http://127.0.0.1:4361/');
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));const X='/Volumes/American Dream/hudongpin/g678-p060-native-browser-20261003-v1';
 await page.setViewportSize({width:1360,height:1000});await page.waitForFunction(()=>typeof window.showContent==='function');const rows=[];
 for(let id=1;id<=24;id++){
  await page.evaluate(id=>window.showContent(id),id);await page.waitForSelector(`[data-question-content="${id}"]`);
  const row=await page.evaluate(()=>{const el=document.querySelector('#gallery');const labels=[...el.querySelectorAll('.p060-graph>span')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,font:parseFloat(getComputedStyle(e).fontSize),rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}};});return {id:Number(el.querySelector('[data-question-content]').getAttribute('data-question-content')),width:el.getBoundingClientRect().width,overflow:el.scrollWidth>el.clientWidth,prompt:el.querySelector('.p060-prompt').textContent,labels,table:[...el.querySelectorAll('td')].map(e=>e.textContent),pathCount:el.querySelectorAll('svg path').length};});
  if(row.overflow||row.labels.some(l=>l.font<20))throw Error('gallery overflow/font '+id);rows.push(row);
  await page.locator('#gallery').screenshot({path:`${X}/native-q${id}-1360-v2.png`});
 }
 for(const width of [390,768])for(const id of [5,17,21,22]){
  await page.setViewportSize({width,height:900});await page.evaluate(id=>window.showContent(id),id);await page.waitForSelector(`[data-question-content="${id}"]`);
  const box=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,font:parseFloat(getComputedStyle(document.querySelector('.p060-prompt')).fontSize),labels:[...document.querySelectorAll('.p060-graph>span')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,left:r.left,right:r.right,top:r.top,bottom:r.bottom};})}));
  if(box.scroll>box.width||box.font<20)throw Error('narrow gallery '+id);rows.push({id,width,...box});await page.locator('#gallery').screenshot({path:`${X}/native-q${id}-${width}-v2.png`});
 }
 if(errors.length)throw Error(errors.join('\n'));return {pass:true,rows,errors,originalRuntime:false};
}
