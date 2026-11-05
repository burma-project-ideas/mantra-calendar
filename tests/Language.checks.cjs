const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:320,height:800},acceptDownloads:true});
  await context.addInitScript(()=>{Storage.prototype.setItem=()=>{throw Error('localStorage must not be used');};});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/crit:|Unhandled exception/i.test(m.text()))errors.push(m.text());});
  await page.goto('http://localhost:5094/manifest.webmanifest');
  await page.evaluate(async()=>{
   const api=await import('/js/practice-db.js');await api.select('2030-01-01');
   await api.restoreBackup(JSON.stringify({format:'mantra-practice-calendar',version:2,activeStartDate:'2030-01-01',schedules:[{startDate:'2030-01-01',progress:[]}],deletedSchedules:[{id:'deleted:language-test',startDate:'2029-01-01',progress:[],deletedAt:'2026-11-05T00:00:00.000Z'}]}));
  });
  const snapshot=()=>page.evaluate(async()=>JSON.stringify(await(await import('/js/practice-db.js')).exportBackup()));
  const before=await snapshot();
  await page.evaluate(async()=>{
   const api=await import('/js/practice-db.js');
   let rejected=false;try{await api.setLanguage('unsupported');}catch{rejected=true;}
   if(!rejected||await api.getLanguage()!=='mm')throw Error('Invalid language must not be persisted');
  });
  await page.goto('http://localhost:5094/');
  await page.locator('#ui-language').waitFor();
  await page.waitForFunction(()=>!document.querySelector('#saved-schedule')?.disabled);
  assert.equal(await page.locator('#ui-language').inputValue(),'mm');
  assert.equal(await page.locator('html').getAttribute('lang'),'my');
  assert.ok((await page.locator('#saved-schedules-label').innerText()).includes('သိမ်းထားသော'));
  await page.getByRole('button',{name:'ယနေ့',exact:true}).waitFor();
  assert.ok((await page.locator('.period-label').innerText()).includes('ဇန်နဝါရီ'));
  assert.ok((await page.locator('.rz-scheduler-nav-title').innerText()).includes('ဇန်နဝါရီ'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const output=path.resolve('outputs/languages');await fs.mkdir(output,{recursive:true});
  await page.screenshot({path:path.join(output,'myanmar-mobile.png'),fullPage:true});
  const language=page.locator('#ui-language');
  await page.evaluate(()=>{
   window.originalPut=IDBObjectStore.prototype.put;
   IDBObjectStore.prototype.put=function(value,key){if(key==='language')throw Error('Simulated preference failure');return window.originalPut.call(this,value,key);};
  });
  await language.selectOption('en');
  await page.locator('.language-error').waitFor();
  assert.equal(await language.inputValue(),'mm');assert.equal(await snapshot(),before);
  await page.evaluate(()=>IDBObjectStore.prototype.put=window.originalPut);
  await language.selectOption('en');
  await page.getByRole('button',{name:'Use schedule',exact:true}).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await snapshot(),before);
  await page.reload();await page.getByRole('button',{name:'Use schedule',exact:true}).waitFor();
  assert.equal(await language.inputValue(),'en');
  await page.locator('.rz-month-view .rz-event-content').first().click();
  let dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Save practice',exact:true}).waitFor();
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
  await language.selectOption('mm');await page.getByRole('button',{name:'အစီအစဉ်ကို အသုံးပြုရန်',exact:true}).waitFor();
  await page.locator('.rz-month-view .rz-event-content').first().click();
  dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'ရွတ်ဖတ်မှုကို သိမ်းရန်',exact:true}).waitFor();
  await dialog.getByRole('button',{name:'မလုပ်တော့ပါ',exact:true}).click();
  for(const name of ['ရွေးထားသော မိတ္တူကို အပြီးဖျက်ရန်','ဖျက်ထားသော စာရင်းအားလုံးကို ရှင်းရန်']){
   await page.getByRole('button',{name,exact:true}).click();dialog=page.getByRole('dialog');
   await dialog.locator('.backup-checking').waitFor({state:'hidden'});
   assert.ok((await dialog.locator('.backup-warning').innerText()).includes('အရန်ဖိုင်'));
   const download=page.waitForEvent('download');
   await dialog.getByRole('button',{name:'အရန်ဖိုင် ထုတ်သိမ်းရန်',exact:true}).click();await download;
   await dialog.locator('.export-status').waitFor();
   assert.ok((await dialog.locator('.last-backup').innerText()).includes('နောက်ဆုံး'));
   await page.screenshot({path:path.join(output,name.startsWith('ရွေး')?'myanmar-single-dialog.png':'myanmar-empty-dialog.png'),fullPage:true});
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   if(name.startsWith('ရွေး')) {
    await page.evaluate(async()=>{const api=await import('/js/practice-db.js');await api.save('2030-01-01',[{date:'2030-01-01T00:00:00',mantraName:'အရဟံ',isPracticed:true}]);});
   }
  }
  await page.reload();await page.waitForFunction(()=>!document.querySelector('#saved-schedule')?.disabled);
  assert.equal(await language.inputValue(),'mm');
  const backup=await page.evaluate(async()=> (await import('/js/practice-db.js')).exportBackup());
  assert.equal(backup.schedules[0].progress.length,1);assert.equal(backup.deletedSchedules.length,1);
  assert.ok(!('language' in backup));
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Myanmar overflow at '+width);}
  await page.screenshot({path:path.join(output,'myanmar-desktop.png'),fullPage:true});
  assert.deepEqual(errors,[]);assert.equal(await page.locator('#blazor-error-ui').isVisible(),false);
  await context.close();console.log('PASS: Myanmar default, EN/MM switching/reload, IndexedDB preference, no localStorage writes, translated calendar/editor/backup dialogs, intact journal and 320–1440px layouts.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
