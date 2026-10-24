// Wait for initial feedback focus before keyboard activation; no delays in nested fast Escape.
async(page)=>{
 const rows=[];await page.waitForFunction(()=>document.querySelector("[data-p051-player-phase]")?.dataset.p051PlayerPhase==="ready",{},{timeout:45000});
 for(const term of ["fraction","equivalent"])for(const close of ["escape-fast","escape-settled","button"]){
  await page.waitForFunction(()=>!document.querySelector('[data-p051-item="1"]').disabled);
  await page.locator('[data-p051-item="1"]').press("Enter");await page.locator('[data-p051-target="0"]').press("Enter");
  await page.locator(".p051-wrong[open]").waitFor();
  await page.waitForFunction(()=>document.activeElement===document.querySelector(".p051-wrong h3"));
  await page.locator('.p051-wrong [data-p051-term="'+term+'"]').press("Enter");
  await page.locator(".p051-glossary-dialog[open]").waitFor();
  const modalStack=await page.evaluate(()=>({outer:document.querySelector(".p051-wrong").matches(":modal"),nested:document.querySelector(".p051-glossary-dialog").matches(":modal"),contexts:window.__p051AudioContexts?.map(c=>c.state)}));
  if(close==="button")await page.locator(".p051-glossary-dialog button").press("Enter");else await page.keyboard.press("Escape");
  await page.locator(".p051-glossary-dialog").waitFor({state:"detached"});
  if(close==="escape-settled")await page.waitForTimeout(300);
  const restored=await page.evaluate(()=>({term:document.activeElement?.getAttribute("data-p051-term"),outer:document.querySelector(".p051-wrong").matches(":modal"),phase:document.querySelector("[data-p051-player-phase]").dataset.p051PlayerPhase}));
  await page.keyboard.press("Escape");await page.waitForFunction(()=>!document.querySelector(".p051-wrong[open]"),{},{timeout:3000});
  const after=await page.evaluate(()=>({item:document.activeElement?.getAttribute("data-p051-item"),phase:document.querySelector("[data-p051-player-phase]").dataset.p051PlayerPhase,players:document.querySelectorAll("[data-p051-player-phase]").length}));
  const pass=modalStack.outer&&modalStack.nested&&restored.term===term&&restored.outer&&restored.phase==="wrong-feedback"&&after.item==="1"&&after.phase==="ready"&&after.players===1;
  rows.push({term,close,modalStack,restored,after,pass});await page.evaluate(rows=>window.__p051ModalRows=rows,rows);if(!pass)throw Error(JSON.stringify(rows));
 }
 return {url:page.url(),passed:rows.every(r=>r.pass),rows};
}
