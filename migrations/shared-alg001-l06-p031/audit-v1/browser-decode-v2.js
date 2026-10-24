async (page) => {
 await page.evaluate(()=>window.ready);
 const result=await page.evaluate(()=>window.measure());
 result.canvas=await page.evaluate(()=>({width:document.getElementById('stage').width,height:document.getElementById('stage').height,frame:document.getElementById('stage').getAttribute('data-flash-frame')}));
 await page.locator('#stage').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p031-canvas-20261003-v1/main1611-v1.png'});
 return result;
}