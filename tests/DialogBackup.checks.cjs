const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({channel:'msedge',headless:true});
    try {
        const context=await browser.newContext({viewport:{width:320,height:700}});
        const page=await context.newPage();
        const pageErrors=[];
        page.on('pageerror',error=>pageErrors.push(error.message));
        page.on('console',message=>{
            if(message.type()==='error' && /Unhandled exception|crit:|fail:/i.test(message.text()))pageErrors.push(message.text());
        });
        await page.goto('http://localhost:5094/manifest.webmanifest');
        await page.evaluate(async()=>{
            const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('mantra-practice-calendar',1);r.onupgradeneeded=()=>r.result.createObjectStore('journal');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
            await new Promise((resolve,reject)=>{
                const tx=db.transaction('journal','readwrite'),store=tx.objectStore('journal');
                store.put('2030-01-01','activeStartDate');store.put([],'schedule:2030-01-01');
                const copy=(date,names)=>({startDate:date,deletedAt:'2026-11-04T00:00:00.000Z',progress:names.map(mantraName=>({date:date+'T00:00:00',mantraName,isPracticed:true}))});
                store.put(copy('2026-11-04',['အရဟံ']),'deleted:copy-a');
                store.put(copy('2026-11-05',['အရဟံ','သမ္မာသမ္ဗုဒ္ဓါ']),'deleted:copy-b');
                tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);
            });db.close();
        });
        await page.goto('http://localhost:5094/');
        const picker=page.getByRole('combobox',{name:'Deleted schedule',exact:true});
        await picker.waitFor();
        await page.waitForFunction(()=>{const b=document.querySelector('.restore-deleted');return b&&!b.disabled;});
        await picker.selectOption('deleted:copy-b');
        const snapshot=()=>page.evaluate(async()=>JSON.stringify(await(await import('/js/practice-db.js')).exportBackup()));
        const before=await snapshot();
        await page.evaluate(()=>{
            window.deleteAttempts=0;
            IDBObjectStore.prototype.delete=()=>{window.deleteAttempts++;throw Error('Cancellation must not remove data');};
            const originalGet=IDBObjectStore.prototype.get;
            window.statusReads=0;
            IDBObjectStore.prototype.get=function(key){
                if(key==='lastBackupExportedAt')window.statusReads++;
                return originalGet.call(this,key);
            };
        });
        const holdStatus=()=>page.evaluate(async()=>{
            const db=await new Promise(resolve=>{const r=indexedDB.open('mantra-practice-calendar',1);r.onsuccess=()=>resolve(r.result);});
            const tx=db.transaction('journal','readwrite'),store=tx.objectStore('journal');
            window.holdStatus=true;
            const pump=()=>{const r=store.get('activeStartDate');r.onsuccess=()=>{if(window.holdStatus)pump();};};pump();
            tx.oncomplete=()=>db.close();
        });
        for (const mode of [
            {open:'Permanently delete selected copy',final:'Permanently delete',keep:'Keep recovery copy'},
            {open:'Empty recently deleted',final:'Empty recently deleted',keep:'Keep recovery history'}
        ]) {
            await holdStatus();
            await page.getByRole('button',{name:mode.open,exact:true}).click();
            const dialog=page.getByRole('dialog');await dialog.waitFor();
            await page.waitForFunction(text=>document.activeElement?.textContent===text,mode.keep);
            await dialog.locator('.backup-checking').waitFor();
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isDisabled(),true);
            assert.equal(await dialog.getByRole('button',{name:mode.keep,exact:true}).isEnabled(),true);
            await page.evaluate(()=>window.holdStatus=false);
            await dialog.locator('.backup-checking').waitFor({state:'hidden'});
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isEnabled(),true);
            await page.evaluate(()=>{
                window.originalGet=IDBObjectStore.prototype.get;
                IDBObjectStore.prototype.get=function(key){
                    if(key==='lastBackupExportedAt'||key==='lastBackupFingerprint')throw Error('Simulated status failure');
                    return window.originalGet.call(this,key);
                };
                window.dispatchEvent(new Event('focus'));
            });
            await dialog.locator('.backup-warning').filter({hasText:'could not be checked'}).waitFor();
            await dialog.locator('.backup-checking').waitFor({state:'hidden'});
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isEnabled(),true);
            await page.evaluate(()=>{IDBObjectStore.prototype.get=window.originalGet;window.dispatchEvent(new Event('focus'));});
            await dialog.locator('.backup-checking').waitFor({state:'hidden'});
            await holdStatus();
            await page.evaluate(()=>{window.statusReads=0;window.dispatchEvent(new Event('focus'));});
            await dialog.locator('.backup-checking').waitFor();
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isDisabled(),true);
            await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
            await page.evaluate(()=>window.holdStatus=false);
            await dialog.locator('.backup-checking').waitFor({state:'hidden'});
            assert.ok(await page.evaluate(()=>window.statusReads>=2),'Return during a check must queue another check');
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isEnabled(),true);
            await page.evaluate(()=>{window.originalBlobURL=URL.createObjectURL;URL.createObjectURL=()=>{throw Error('Simulated download failure');};});
            await dialog.getByRole('button',{name:'Export backup',exact:true}).click();
            await dialog.locator('.export-error:not(.backup-warning)').waitFor();
            assert.match(await dialog.locator('.export-error:not(.backup-warning)').innerText(),/Nothing was deleted/);
            assert.equal(await snapshot(),before);
            await page.evaluate(async()=>{
                URL.createObjectURL=window.originalBlobURL;
                const db=await new Promise(resolve=>{const r=indexedDB.open('mantra-practice-calendar',1);r.onsuccess=()=>resolve(r.result);});
                const tx=db.transaction('journal','readwrite'),store=tx.objectStore('journal');
                window.holdExport=true;
                const pump=()=>{const r=store.get('activeStartDate');r.onsuccess=()=>{if(window.holdExport)pump();};};pump();
                tx.oncomplete=()=>db.close();
            });
            const downloadPromise=page.waitForEvent('download');
            await dialog.getByRole('button',{name:'Export backup',exact:true}).click();
            await dialog.getByRole('button',{name:'Exporting backup…',exact:true}).waitFor();
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isDisabled(),true);
            assert.equal(await dialog.getByRole('button',{name:mode.keep,exact:true}).isEnabled(),true);
            await page.evaluate(()=>window.holdExport=false);
            const download=await downloadPromise;
            const fs=require('node:fs');const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
            assert.equal(backup.version,2);assert.equal(backup.schedules.length,1);assert.equal(backup.deletedSchedules.length,2);
            assert.equal(backup.deletedSchedules.find(x=>x.id==='deleted:copy-b').progress.length,2);
            await dialog.locator('.export-status').waitFor();
            assert.equal(await dialog.locator('.backup-warning').count(),0);
            assert.match(await dialog.locator('.export-status').innerText(),/Save the JSON file/);
            assert.equal(await dialog.getByRole('button',{name:mode.final,exact:true}).isEnabled(),true);
            assert.equal(await snapshot(),before);
            assert.ok(await dialog.evaluate(e=>e.getBoundingClientRect().right<=innerWidth));
            await dialog.getByRole('button',{name:mode.keep,exact:true}).click();await dialog.waitFor({state:'hidden'});
        }
        assert.equal(await page.evaluate(()=>window.deleteAttempts),0);
        await page.clock.install();
        await page.clock.pauseAt(new Date(Date.now()+1000));
        const otherTab=await context.newPage();
        await otherTab.goto('http://localhost:5094/manifest.webmanifest');
        for(const name of ['Permanently delete selected copy','Empty recently deleted']) {
            await page.getByRole('button',{name,exact:true}).click();
            const dialog=page.getByRole('dialog');await dialog.waitFor();
            for(const change of ['progress','schedule','history']) {
                await otherTab.evaluate(async change=>{
                    const api=await import('/js/practice-db.js');
                    if(change==='progress') {
                        const backup=await api.exportBackup();
                        await api.save('2030-01-01',backup.schedules.find(x=>x.startDate==='2030-01-01').progress.length ? [] : [{date:'2030-01-01T00:00:00',mantraName:'test',isPracticed:true}]);
                    }
                    if(change==='schedule')await api.select((await api.exportBackup()).activeStartDate==='2030-01-01' ? '2031-01-01' : '2030-01-01');
                    if(change==='history') {
                        const backup=await api.exportBackup();
                        backup.deletedSchedules.push({id:'deleted:cross-tab-'+crypto.randomUUID(),startDate:'2032-01-01',progress:[],deletedAt:new Date().toISOString()});
                        await api.restoreBackup(JSON.stringify(backup));
                    }
                },change);
                await page.evaluate(event=>{
                    if(event==='focus')window.dispatchEvent(new Event(event));
                    else document.dispatchEvent(new Event(event));
                },change==='progress' ? 'focus' : 'visibilitychange');
                await dialog.locator('.backup-warning').filter({hasText:'have changed since'}).waitFor({timeout:1500});
                const focused=await page.evaluate(()=>document.activeElement?.textContent);
                const downloaded=otherTab.waitForEvent('download');
                await otherTab.evaluate(async()=>{await(await import('/js/practice-db.js')).downloadBackup();});
                await downloaded;
                await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
                await dialog.locator('.backup-warning').waitFor({state:'hidden',timeout:1500});
                assert.equal(await page.evaluate(()=>document.activeElement?.textContent),focused);
            }
            await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
        }
        await otherTab.close();
        await page.evaluate(async()=>{
            const api=await import('/js/practice-db.js');
            if(await api.backupChangesWarning()!==null)throw Error('Fresh backup flagged stale');
            await api.save('2030-01-01',[{date:'2030-01-01T00:00:00',mantraName:'test',isPracticed:true}]);
            if(!(await api.backupChangesWarning()).includes('have changed'))throw Error('Missed progress change');
            await api.save('2030-01-01',[]);
            if(await api.backupChangesWarning()!==null)throw Error('Unchanged content flagged stale');
            await api.select('2031-01-01');
            if(!(await api.backupChangesWarning()).includes('have changed'))throw Error('Missed schedule change');
            const db=await new Promise(resolve=>{const r=indexedDB.open('mantra-practice-calendar',1);r.onsuccess=()=>resolve(r.result);});
            const write=(key,value)=>new Promise(resolve=>{
                const tx=db.transaction('journal','readwrite');tx.objectStore('journal').put(value,key);tx.oncomplete=resolve;
            });
            const baseline=await api.exportBackup();
            const fingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(baseline)));
            await write('lastBackupFingerprint',Array.from(new Uint8Array(fingerprint),byte=>byte.toString(16).padStart(2,'0')).join(''));
            if(await api.backupChangesWarning()!==null)throw Error('Baseline mismatch');
            await write('deleted:copy-b',{...baseline.deletedSchedules.find(x=>x.id==='deleted:copy-b'),deletedAt:'2026-11-05T00:00:00.000Z'});
            if(!(await api.backupChangesWarning()).includes('have changed'))throw Error('Missed recovery-history change');
            db.close();
        });
        for(const name of ['Permanently delete selected copy','Empty recently deleted']) {
            await page.getByRole('button',{name,exact:true}).click();
            const dialog=page.getByRole('dialog');await dialog.locator('.backup-warning').waitFor();
            assert.match(await dialog.locator('.backup-warning').innerText(),/have changed since/);
            await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
        }
        for(const name of ['Permanently delete selected copy','Empty recently deleted']) {
            await holdStatus();
            await page.getByRole('button',{name,exact:true}).click();
            const dialog=page.getByRole('dialog');await dialog.locator('.backup-checking').waitFor();
            await dialog.getByRole('button',{name:/^Keep recovery/}).click();
            await dialog.waitFor({state:'hidden'});
            await page.evaluate(()=>{window.holdStatus=false;window.dispatchEvent(new Event('focus'));});
        }
        assert.deepEqual(pageErrors,[]);
        assert.equal(await page.locator('#blazor-error-ui').isVisible(),false);
        console.log('PASS: both dialogs pass initial/queued-return checks, check failures, safe cancellation during checks, export/retry, cross-tab changes, preserved data and 320px layout without browser errors.');
        await context.close();
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

