async page => {
 await page.goto('http://127.0.0.1:4361/');await page.waitForFunction(()=>window.snap?.quiz?.phase==='question');const rows=[];const X='/Volumes/American Dream/hudongpin/g678-p060-native-browser-20261003-v1';
 for(const locale of ['en','es'])for(const width of [390,768,1360])for(const id of [5,17,21,22]){
  await page.setViewportSize({width,height:1000});await page.evaluate(({locale,id})=>{window.setLocale(locale);window.setSeed(window.seeds[id]);},{locale,id});
  await page.waitForFunction(({locale,id})=>window.snap.language===locale&&Number(document.querySelector('[data-p060-question]')?.getAttribute('data-p060-question'))===id,{locale,id});
  const row=await page.evaluate(()=>{const el=document.querySelector('.p060-quiz'),box=el.getBoundingClientRect();return{width:innerWidth,scroll:document.documentElement.scrollWidth,quizWidth:box.width,promptFont:parseFloat(getComputedStyle(el.querySelector('.p060-prompt')).fontSize),buttons:[...el.querySelectorAll('button,select')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,height:r.height,left:r.left,right:r.right};}),labels:[...el.querySelectorAll('.p060-graph>span')].map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,font:parseFloat(getComputedStyle(e).fontSize),left:r.left,right:r.right,top:r.top,bottom:r.bottom};})};});
  if(row.scroll>width||row.promptFont<20||row.buttons.some(b=>b.height<44||b.left<0||b.right>width+.2)||row.labels.some(l=>l.font<20||l.left<0||l.right>width))throw Error('responsive '+JSON.stringify({locale,id,row}));
  for(let i=0;i<row.labels.length;i++)for(let j=i+1;j<row.labels.length;j++){const a=row.labels[i],b=row.labels[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)throw Error('label overlap '+JSON.stringify({locale,id,width,a,b}));}
  rows.push({locale,id,...row});if(id===17||id===22)await page.locator('.p060-quiz').screenshot({path:`${X}/${locale}-quiz-q${id}-${width}-v1.png`});
 }
 return {pass:true,rows,requests:await page.evaluate(()=>window.requests.length),contexts:await page.evaluate(()=>window.contexts.length)};
}
