const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/crit:|Unhandled exception/i.test(m.text()))errors.push(m.text());});
  await page.goto('http://localhost:5094/manifest.webmanifest');
  await page.evaluate(async()=>{const api=await import('/js/practice-db.js');await api.select('2026-11-01');});
  await page.goto('http://localhost:5094/');
  await page.waitForFunction(()=>!document.querySelector('#saved-schedule')?.disabled);
  await page.locator('.rz-month-view .rz-event-content').first().click();
  const practice=page.getByRole('dialog');await practice.getByRole('button',{name:'Save practice',exact:true}).waitFor();
  await practice.locator('.mantra-row .rz-label').first().click();
  await practice.getByRole('button',{name:'Save practice',exact:true}).click();
  await practice.waitFor({state:'hidden'});
  assert.match(await page.locator('.summary-total').innerText(),/1/);
  const output=path.resolve('outputs/redesign');await fs.mkdir(output,{recursive:true});
  for(const width of [1440,1024,768,390,320]){
   await page.setViewportSize({width,height:width<768?844:1080});
   await page.evaluate(()=>document.fonts.ready);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow at '+width);
   const regions=await page.evaluate(()=>({calendar:document.querySelector('.calendar-workspace').getBoundingClientRect().toJSON(),tools:document.querySelector('.practice-tools').getBoundingClientRect().toJSON()}));
   if(width<768)assert.ok(regions.tools.top>regions.calendar.bottom-1);else assert.ok(regions.tools.left>regions.calendar.right);
   assert.ok(await page.evaluate(()=>document.fonts.check('16px Geist')));
   await page.locator('h1').click();
   await page.screenshot({path:path.join(output,'calendar-'+width+'.png'),fullPage:true});
   if(width===1440||width===390)await page.screenshot({path:path.join(output,'preview-'+width+'.png')});
  }
  await page.getByRole('link',{name:'Manage schedules'}).click();
  await page.waitForFunction(()=>document.activeElement.id==='practice-tools',{timeout:1500});
  await page.locator('#schedule-start').fill('2026-12-01');
  await page.getByRole('button',{name:'Use schedule',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#saved-schedule').value==='2026-12-01'&&!document.querySelector('#saved-schedule').disabled);
  await page.locator('#saved-schedule').selectOption('2026-11-01');
  await page.waitForFunction(()=>!document.querySelector('#saved-schedule').disabled);
  assert.match(await page.locator('.summary-total').innerText(),/1/);
  await page.locator('.rz-month-view .rz-event-content').first().focus();
  await page.keyboard.press('Enter');
  await practice.waitFor();await practice.getByRole('button',{name:'Cancel',exact:true}).click();
  assert.equal(await page.locator('#blazor-error-ui').isVisible(),false);assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(output,'mobile-final.png'),fullPage:true});
  console.log('PASS: 1440/1024/768/390/320px layouts, zero horizontal overflow, loaded local Geist, calendar-first mobile, focused tools link, saved practice, new/switch schedules and keyboard day entry.');
  await context.close();
 } finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

