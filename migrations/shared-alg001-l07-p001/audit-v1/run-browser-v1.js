async page=>{
 const errors=[],rows=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://127.0.0.1:4373');
 await page.waitForFunction(()=>window.snap?.phase==='paused');
 const snapshot=()=>page.evaluate(()=>({state:window.snap,reads:window.reads,contexts:window.contexts.map(c=>c.state)}));
 if((await snapshot()).reads!==0)throw Error('initial autoplay');
 await page.getByRole('combobox').selectOption('es');if((await snapshot()).reads!==0)throw Error('locale autoplay');
 await page.getByRole('button',{name:'Reproducir',exact:true}).click();await page.waitForFunction(()=>window.snap.phase==='playing'&&window.snap.frame>4);
 rows.push({case:'explicit-play',...await snapshot()});
 await page.getByRole('button',{name:'Pausa',exact:true}).click();await page.waitForFunction(()=>window.snap.phase==='paused');
 const held=(await snapshot()).state.frame;await page.waitForTimeout(250);if((await snapshot()).state.frame!==held)throw Error('pause advanced');
 rows.push({case:'pause-held',...await snapshot()});
 await page.getByRole('button',{name:'Reproducir',exact:true}).click();await page.waitForFunction(()=>window.snap.phase==='playing'&&window.snap.cycle>=2,{}, {timeout:30000});
 rows.push({case:'two-natural-cycles',...await snapshot()});
 await page.getByRole('button',{name:'Pausa',exact:true}).click();await page.getByRole('button',{name:'Repetir',exact:true}).click();
 await page.waitForFunction(()=>window.snap.phase==='playing'&&window.snap.replay===1&&window.snap.cycle===0);
 if((await snapshot()).contexts.filter(v=>v!=='closed').length!==1)throw Error('Replay duplicate context');
 rows.push({case:'Replay-reset',...await snapshot()});
 await page.getByRole('button',{name:'Volume',exact:true}).click();if((await snapshot()).state.volume!==0)throw Error('volume');
 await page.getByRole('button',{name:'Pausa',exact:true}).click();await page.getByRole('button',{name:'Motion',exact:true}).click();
 for(const width of [390,768,1360]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
  const layout=await page.locator('.alg-l07-p001').evaluate(e=>{const title=e.querySelector('h2'),r=title.getBoundingClientRect(),b=e.getBoundingClientRect();return {width:innerWidth,doc:document.documentElement.scrollWidth,title:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},box:{left:b.left,right:b.right,top:b.top,bottom:b.bottom},font:getComputedStyle(title).fontSize,text:title.textContent};});
  if(layout.doc>width||layout.title.left<layout.box.left||layout.title.right>layout.box.right||layout.title.bottom>layout.box.bottom||!layout.text.includes('Linear and Nonlinear Functions:'))throw Error('title clipping');
  await page.screenshot({path:`output/playwright/alg-l07-p001-standalone-v1/es-${width}-v1.png`});rows.push({case:'responsive-poster',layout});
 }
 await page.getByRole('button',{name:'Mount',exact:true}).click();await page.waitForFunction(()=>window.contexts.every(c=>c.state==='closed'));rows.push({case:'leave-closes',...await snapshot()});
 if(errors.length)throw Error(errors.join('\n'));return {pass:true,rows,errors,sourceFidelityAccepted:false,registered:false};
}
