const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error' && /Unhandled exception|crit:|fail:/i.test(m.text()))errors.push(m.text());});
  const output=path.resolve('outputs/complete-flow');await fs.mkdir(output,{recursive:true});
  const ready=()=>page.waitForFunction(()=>{const e=document.querySelector('#saved-schedule');return e&&!e.disabled;});
  const snapshot=()=>page.evaluate(async()=> (await import('/js/practice-db.js')).exportBackup());
  const importFile=async text=>{
   await page.locator('#backup-file').setInputFiles({name:'test-backup.json',mimeType:'application/json',buffer:Buffer.from(text)});
   await page.getByRole('region',{name:'Review backup restore'}).waitFor();
   await page.getByRole('button',{name:'Restore backup',exact:true}).click();await ready();
  };
  const exported=async scope=>{
   const waiting=page.waitForEvent('download');await scope.getByRole('button',{name:'Export backup',exact:true}).click();
   const download=await waiting;const file=await download.path();const text=await fs.readFile(file,'utf8');
   assert.equal(JSON.parse(text).version,2);return text;
  };
  await page.goto('http://localhost:5094/');await ready();
  const fixture={format:'mantra-practice-calendar',version:2,activeStartDate:'2030-01-01',schedules:[
   {startDate:'2030-01-01',progress:[{date:'2030-01-01T00:00:00',mantraName:'အရဟံ',isPracticed:true}]},
   {startDate:'2031-01-01',progress:[]}
  ],deletedSchedules:[{id:'deleted:e2e-seed',startDate:'2029-01-01',progress:[],deletedAt:'2026-11-05T00:00:00.000Z'}]};
  await importFile(JSON.stringify(fixture));
  assert.equal(await page.locator('#saved-schedule').inputValue(),'2030-01-01');
  assert.equal((await snapshot()).schedules.find(s=>s.startDate==='2030-01-01').progress.length,1);
  console.log('PASS: import preview/restore loads schedules, progress and recovery history.');
  await exported(page);
  const before=await snapshot();
  await page.getByRole('button',{name:'Delete selected schedule',exact:true}).click();
  let dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Keep schedule',exact:true}).click();await ready();
  assert.deepEqual(await snapshot(),before);
  const softDelete=async()=>{
   await page.getByRole('button',{name:'Delete selected schedule',exact:true}).click();
   await page.getByRole('dialog').getByRole('button',{name:'Delete schedule',exact:true}).click();await ready();
  };
  await softDelete();
  let data=await snapshot();let copy=data.deletedSchedules.find(c=>c.startDate==='2030-01-01');
  assert.ok(copy);assert.equal(copy.progress.length,1);assert.ok(!data.schedules.some(s=>s.startDate==='2030-01-01'));
  await page.locator('#deleted-schedule').selectOption(copy.id);
  await page.getByRole('button',{name:'Restore selected schedule',exact:true}).click();await ready();
  data=await snapshot();assert.equal(data.schedules.find(s=>s.startDate==='2030-01-01').progress.length,1);
  assert.ok(!data.deletedSchedules.some(c=>c.id===copy.id));
  console.log('PASS: cancel delete preserves data; confirmed delete creates recovery copy; restore recovers progress.');
  await softDelete();data=await snapshot();copy=data.deletedSchedules.find(c=>c.startDate==='2030-01-01');
  await page.locator('#deleted-schedule').selectOption(copy.id);
  await page.getByRole('button',{name:'Permanently delete selected copy',exact:true}).click();
  dialog=page.getByRole('dialog');await dialog.locator('.backup-checking').waitFor({state:'hidden'});
  await dialog.locator('.backup-warning').filter({hasText:'have changed'}).waitFor();
  const copyBackup=await exported(dialog);await dialog.locator('.export-status').waitFor();
  await dialog.locator('.backup-checking').waitFor({state:'hidden'});
  assert.equal(await dialog.locator('.backup-warning').count(),0);
  await page.screenshot({path:path.join(output,'single-delete-confirmation.png'),fullPage:true});
  const savedBefore=JSON.stringify((await snapshot()).schedules);
  await dialog.getByRole('button',{name:'Permanently delete',exact:true}).click();await ready();
  data=await snapshot();assert.ok(!data.deletedSchedules.some(c=>c.id===copy.id));
  assert.equal(JSON.stringify(data.schedules),savedBefore);assert.ok(data.deletedSchedules.some(c=>c.id==='deleted:e2e-seed'));
  await page.reload();await ready();assert.ok(!(await snapshot()).deletedSchedules.some(c=>c.id===copy.id));
  await importFile(copyBackup);assert.ok((await snapshot()).deletedSchedules.some(c=>c.id===copy.id));
  console.log('PASS: dialog export clears stale warning; confirmed permanent deletion removes only selected copy, survives reload; backup import recovers it.');
  await page.getByRole('button',{name:'Empty recently deleted',exact:true}).click();
  dialog=page.getByRole('dialog');await dialog.locator('.backup-checking').waitFor({state:'hidden'});
  await dialog.getByRole('button',{name:'Keep recovery history',exact:true}).click();await ready();
  const beforeEmpty=await snapshot();
  await page.getByRole('button',{name:'Empty recently deleted',exact:true}).click();
  dialog=page.getByRole('dialog');await dialog.locator('.backup-checking').waitFor({state:'hidden'});
  const historyBackup=await exported(dialog);await dialog.locator('.export-status').waitFor();
  await dialog.locator('.backup-checking').waitFor({state:'hidden'});
  await page.screenshot({path:path.join(output,'empty-history-confirmation.png'),fullPage:true});
  await dialog.getByRole('button',{name:'Empty recently deleted',exact:true}).click();await ready();
  data=await snapshot();assert.equal(data.deletedSchedules.length,0);assert.deepEqual(data.schedules,beforeEmpty.schedules);
  await page.reload();await ready();assert.equal((await snapshot()).deletedSchedules.length,0);
  await importFile(historyBackup);data=await snapshot();assert.equal(data.deletedSchedules.length,beforeEmpty.deletedSchedules.length);
  assert.deepEqual(data.schedules,beforeEmpty.schedules);
  await page.screenshot({path:path.join(output,'restored-calendar.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  assert.equal(await page.locator('#blazor-error-ui').isVisible(),false);
  console.log('PASS: confirmed Empty recently deleted clears all recovery history, preserves saved progress, survives reload, and backup import restores recovery history.');
  console.log('PASS: no browser page errors. Screenshots: '+output);
  await context.close();
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

